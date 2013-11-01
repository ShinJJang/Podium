/*

 Copyright 2013 tadruj

 Project home: https://github.com/tadruj/s3upload-coffee-javascript

 Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 */

(function () {

    window.S3Upload = (function () {
        S3Upload.prototype.s3_sign_put_url = '/signS3put';
        S3Upload.prototype.file_dom_selector = '#file_upload';
        S3Upload.prototype.onFinishS3Put = function (public_url, file) {
            return console.log('base.onFinishS3Put()', public_url, file);
        };

        S3Upload.prototype.onProgress = function (percent, status, public_url, file) {
            return console.log('base.onProgress()', percent, status, public_url, file);
        };

        S3Upload.prototype.onError = function (status, file) {
            return console.log('base.onError()', status, file);
        };

        function S3Upload(options) {

            if (options == null) {
                options = {};
            }
            _.extend(this, options);
            if (options.file_dom_selector) {
                this.handleFileSelect($(this.file_dom_selector).get(0), options);
            }
            else {
                console.log("opt file count = " + options.opt_key_file_count);
                console.log("opt file name = " + options.opt_key_file_name);
                console.log("opti method = " + options.opt_method);
                this.uploadFile(null, options);
            }
        }

        S3Upload.prototype.handleFileSelect = function (file_element, opts) {
            console.log("handleFileSelect option  = " + opts.opt_method);
            var f, files, output, _i, _len, _results;
            this.onProgress(0, 'Upload started.');
            files = file_element.files;
            output = [];
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
                f = files[_i];
                _results.push(this.uploadFile(f, opts));
            }
            return _results;
        };

        S3Upload.prototype.createCORSRequest = function (method, url) {
            var xhr;
            xhr = new XMLHttpRequest();
            if (xhr.withCredentials != null) {
                xhr.open(method, url, true);
            } else if (typeof XDomainRequest !== "undefined") {
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                xhr = null;
            }
            return xhr;
        };

        S3Upload.prototype.executeOnSignedUrl = function (file, callback, opts) {
            var name, this_s3upload, type, xhr;
            this_s3upload = this;
            xhr = new XMLHttpRequest();
            if (opts.opt_method == "DELETE") {
                name = opts.opt_key_file_name;
                type = opts.opt_key_file_type;
            }
            else if (opts.opt_method == "PUT") {
                console.log("opts = " + file.type);
                type = opts && opts.type || file.type;
                name = opts && opts.name || file.name;
            }
            var delete_space = encodeURIComponent(name).replace("%20", ""); //%20 delete
            console.log("encodeURIComponent(name) = " + delete_space);
            xhr.open('GET', this.s3_sign_put_url + '?s3_object_type=' + type + '&s3_object_name=' + encodeURIComponent(delete_space) + '&s3_method=' + opts.opt_method + '&s3_file_count=' + opts.opt_user_file_count, true); //파일 번호를 추가해야겠다.
            xhr.overrideMimeType('text/plain;' + type);
            xhr.onreadystatechange = function (e) {
                var result;
                if (this.readyState === 4 && this.status === 200) {
                    try {
                        result = JSON.parse(this.responseText);
                        console.log("result.singned_request------------ = " + result.signed_request);
                        result.signed_request = result.signed_request.replace(/\+/g, "%2B");
                        console.log("result.singned_request------------ = " + result.signed_request);
                    } catch (error) {
                        this_s3upload.onError('Signing server returned some ugly/empty JSON: "' + this.responseText + '"');
                        return false;
                    }
                    console.log("result.url = " + result.url);
                    return callback(result.signed_request, result.url);
                } else if (this.readyState === 4 && this.status !== 200) {
                    return this_s3upload.onError('Could not contact request signing server. Status = ' + this.status);
                }
            };
            return xhr.send();
        };

        S3Upload.prototype.uploadToS3 = function (file, url, public_url, opts) { //url is signed_url
            var this_s3upload, type, xhr;
            this_s3upload = this;
            console.log(" uploadToS3 url = " + url);
            console.log(" uploadToS3 public _ url = " + public_url);
            temp_url = url.split("/");
            file_name = temp_url[5].split("?");
            if (opts.opt_key_file_name) {
                url = url.replace(opts.opt_key_file_name, encodeURIComponent(opts.opt_key_file_name));
            }
            else {
                url = url.replace(file.name, encodeURIComponent(file.name));
            }

            if (opts.opt_method == "DELETE") {
                type = opts.opt_key_file_type
            }
            else if (opts.opt_method == "PUT") {
                type = opts && opts.type || file.type;
            }

            xhr = this.createCORSRequest(opts.opt_method, url);
            if (!xhr) {
                this.onError('CORS not supported');
            } else {
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        this_s3upload.onProgress(100, 'Upload completed.', public_url, file);
                        return this_s3upload.onFinishS3Put(public_url, file);
                    }
                    else if (xhr.status === 204) {
                        return this_s3upload.onFinishS3Put(public_url, file);
                    }
                    else {
                        return this_s3upload.onError('Upload error: ' + xhr.status, file);
                    }
                };
                xhr.onerror = function (e) {
                    console.log(e);
                    return this_s3upload.onError('XHR error.', file);
                };
                xhr.upload.onprogress = function (e) {
                    var percentLoaded;
                    if (e.lengthComputable) {
                        percentLoaded = Math.round((e.loaded / e.total) * 100);
                        return this_s3upload.onProgress(percentLoaded, (percentLoaded === 100 ? 'Finalizing.' : 'Uploading.'), public_url, file);
                    }
                };
            }
            xhr.setRequestHeader('Content-Type', type);
            console.log("type = " + type);
            console.log("xhr info" + xhr.data);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            return xhr.send(file);
        };

        S3Upload.prototype.validate = function (file) {
            return null;
        };

        S3Upload.prototype.uploadFile = function (file, opts) {
            var error, this_s3upload;
            error = this.validate(file);
            if (error) {
                this.onError(error, file);
                return null;
            }
            this_s3upload = this;
            if (opts) {
                console.log("uploadfile opts = " + opts.opt_method);
            }
            return this.executeOnSignedUrl(file, function (signedURL, publicURL) {
                return this_s3upload.uploadToS3(file, signedURL, publicURL, opts);
            }, opts);
        };
        return S3Upload;
    })();

}).call(this);
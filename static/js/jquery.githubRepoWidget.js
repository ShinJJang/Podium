/**
 * Created by lacidjun on 2013. 11. 15..
 */
;jQuery(document).ready(function($){

        var i = 0;
        var box_title_png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAXCAMAAAAx3e/WAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQjIyNkJERkM0NjYxMUUxOEFDQzk3ODcxRDkzRjhCRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQjIyNkJFMEM0NjYxMUUxOEFDQzk3ODcxRDkzRjhCRSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRCMjI2QkREQzQ2NjExRTE4QUNDOTc4NzFEOTNGOEJFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRCMjI2QkRFQzQ2NjExRTE4QUNDOTc4NzFEOTNGOEJFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+dka2KgAAAEVQTFRFxMTEyMjI0tLSvb29vr6+zc3Ny8vLxcXFz8/P6enp3t7ex8fH0dHR1NTUw8PDwMDAzs7OvLy8wcHBu7u7v7+/zMzM////budQFwAAABd0Uk5T/////////////////////////////wDmQOZeAAAAcklEQVR42tSQSQ7DMAwD6chOukWs5eX/Ty2coo0T9wOdEzEgdRBuzNmnDofgja52JDyz5TCqUp0O6kfrb4bzSXkRiTviEZZ6JKLMJ5VQ2v8iGbtbfEwXmjFMG0VwdQo10hQNxYqtLMv9O6xvpZ/QeAkwAKjwHiJLaJc3AAAAAElFTkSuQmCC';
        var stats_png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAqCAMAAACEJ4viAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQjIyNkJEQkM0NjYxMUUxOEFDQzk3ODcxRDkzRjhCRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQjIyNkJEQ0M0NjYxMUUxOEFDQzk3ODcxRDkzRjhCRSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRCMjI2QkQ5QzQ2NjExRTE4QUNDOTc4NzFEOTNGOEJFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRCMjI2QkRBQzQ2NjExRTE4QUNDOTc4NzFEOTNGOEJFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+h1kA9gAAAK5QTFRF+fn5sbGx8fHx09PTmpqa2dnZ/f3919fX9PT00NDQ1dXVpKSk+vr6+/v7vb298vLyycnJ8/PztLS0zc3N6enp/v7+q6ur2NjY9/f3srKy/Pz8p6en7u7uoaGhnJyc4eHhtbW1pqam6Ojo9fX17e3toqKirKys1NTUzs7Ox8fHwcHBwMDA5eXlnZ2dpaWl0dHR9vb25ubm4uLi3d3dqqqqwsLCv7+/oKCgmZmZ////8yEsbwAAAMBJREFUeNrE0tcOgjAUBuDSliUoMhTEvfdef9//xUQjgaLX0Ium/ZLT/+SkRPxZpGykvuf5VMJogy5jY9yjDHcWFhqlcRuHc4o6B1QK0BDg+hcZgNDh3NWTwzItH/bRrhvT+g3zSxZkNGCZpoWGIbU0a3Y6zV5VA6keyeDxiw62P0gUqEW0FbDim4nVikFJbU2zZXybUEaxhCqOQqyh5/G0wpWICUwthyqwD4InOMuXJ7/gs7WkoPdVg1vykF8CDACEFanKO3aSYwAAAABJRU5ErkJggg==';


        $('.github-widget').each(function(){
                i++;

                var $container = $(this), $widget,
                        repo = $container.data('repo'),
                        vendorName = repo.split('/')[0],
                        repoName = repo.split('/')[1],
                        vendorUrl = "http://github.com/" + vendorName,
                        repoUrl = "http://github.com/" + vendorName + '/' + repoName;

                $widget = $(
                        '<div class="github-box repo">'
                        +'<div class="github-box-title">'
                        +'<h3><span class="label">REPOSITORIES</span>'
                        +'<a class="owner" href="' + vendorUrl + '">' + vendorName + '</a>'
                        +'/'
                        +'<a class="repo" href="' + repoUrl + '">' + repoName + '</a>'
                        +'</h3>'
                        +'<div class="github-stats">'
                        +'<a class="stargazers" target="_blank" href="' + repoUrl + '/stargazers">?</a>'
                        +'<a class="watchers" target="_blank" href="' + repoUrl + '/watchers">?</a>'
                        +'<a class="forks" target="_blank" href="' + repoUrl + '/network/members">?</a>'
                        +'</div>'
                        +'</div>'
                        +'<div class="github-box-content">'
                        +'<p class="description"><span></span> &mdash; <a target="_blank" href="' + repoUrl + '#readme" class="moreLink">more</a></p>'
                        +'<p class="link"></p>'
                        +'</div>'
                        +'<div class="github-box-download">'
                        +'<p class="commit_message"><span></span> &mdash; <a id="commit_link" target="_blank" href="#" class="moreLink">more</a></p>'
                        +'<p class="updated"></p>'
                        +'<a class="download" href="' + repoUrl + '/zipball/master">Download as zip</a>'
                        +'</div>'
                        +'<div class="github-box-content">'
                        +'<h4>RANKING</h4>'
                        +'<ul class="ranking">'
                        +'<li class="commit_king"></li>'
                        +'<li class="add_line_king"></li>' //TODO 최태건 링크를 사진으로!
                        +'<li class="del_line_king"></li>'
                        +'</ul>'
                        +'</div>'
                        +'</div>'

                );

                $widget.appendTo($container);

                $.ajax({
                        url: 'https://api.github.com/repos/' + repo + '?access_token=5d8f3b01b598b741b0dd601fdbb8a80537db523a',
                        dataType: 'jsonp',
                        success: function(results) {
                                var repo = results.data, date, updated_at = 'unknown';

                                $widget.find('.watchers').text(repo.subscribers_count);
                                $widget.find('.stargazers').text(repo.stargazers_count);
                                $widget.find('.forks').text(repo.forks);
                                $widget.find('.description span').text(repo.description);

                                // Don't show "null" if the repo has no homepage URL.
                                if(repo.homepage != null) $widget.find('.link').append($('<a />').attr('href', repo.homepage).text(repo.homepage));

                        }
                });
                $.ajax({
                        url: 'https://api.github.com/repos/' + repo + '/stats/contributors' + '?access_token=5d8f3b01b598b741b0dd601fdbb8a80537db523a',
                        dataType: 'jsonp',
                        success: function(results) {
                                var repo = results.data;
                                var most_commit_user ,most_commit_user_url, most_commit_user_avatar, most_commit_user_total;
                                var most_add_line_user, most_add_line_user_url, most_add_line_user_avatar, most_add_line_user_total;
                                var most_del_line_user, most_del_line_user_url, most_del_line_user_avatar, most_del_line_user_total;
                                var commit_total = 0, add_line_total = 0, temp_add_line_total = 0, del_line_total = 0, temp_del_line_total = 0;

                                for (var index = 0; index < repo.length; index++) {

                                    if(repo[index].total > commit_total) {
                                        // about commit king
                                        most_commit_user = repo[index].author.login;
                                        most_commit_user_url = repo[index].author.html_url;
                                        most_commit_user_avatar = repo[index].author.avatar_url;
                                        most_commit_user_total = repo[index].total;
                                    }
                                    for(var line_index = 0; line_index < repo[index].weeks.length; line_index++) {
                                        temp_add_line_total = temp_add_line_total + repo[index].weeks[line_index].a;
                                        temp_del_line_total = temp_del_line_total + repo[index].weeks[line_index].d;
                                    }
                                    console.log(temp_del_line_total);
                                    if(temp_add_line_total > add_line_total) {
                                        most_add_line_user_total = temp_add_line_total;
                                        most_add_line_user = repo[index].author.login;
                                        most_add_line_user_url = repo[index].author.html_url;
                                        most_add_line_user_avatar = repo[index].author.avatar_url;
                                        add_line_total = temp_add_line_total;

                                    }

                                    if(temp_del_line_total > del_line_total) {
                                        most_del_line_user_total = temp_del_line_total;
                                        most_del_line_user = repo[index].author.login;
                                        most_del_line_user_url = repo[index].author.html_url;
                                        most_del_line_user_avatar = repo[index].author.avatar_url;
                                        del_line_total = temp_del_line_total;
                                    }
                                    console.log(most_del_line_user);
                                    temp_add_line_total = 0;
                                    temp_del_line_total = 0;
                                    commit_total = repo[index].total;
                                }
                                $widget.find('.commit_king').html('<strong>COMMIT KING</strong><a href="'+ most_commit_user_url + '" target="_blank">' + most_commit_user + '</a><span>(' + most_commit_user_total + ' commits)</span>');
                                $widget.find('.add_line_king').html('<strong>ADD KING</strong><a href="' + most_add_line_user_url + '"target="_blank">' + most_add_line_user + '</a><span>(' + most_add_line_user_total + ' lines)</span>');
                                $widget.find('.del_line_king').html('<strong>DELETE KING</strong><a href="'+ most_del_line_user_url + '" target="_blank">' + most_del_line_user + '</a><span>(' + most_del_line_user_total + ' lines)</span>');

                        }
                });

                $.ajax({
                        url: 'https://api.github.com/repos/' + repo + '/commits?sha=master&access_token=5d8f3b01b598b741b0dd601fdbb8a80537db523a',
                        dataType: 'jsonp',
                        success: function(results) {
                                var repo = results.data, date, pushed_at = 'unknown';
                                console.log(repo);
                                console.log(results);
                                if (repo[0].commit.committer.date) {
                                        date = new Date(repo[0].commit.committer.date);
                                        console.log(date.toLocaleString());
                                        updated_at = date.toLocaleString()

                                }
                                $widget.find('.commit_message span').html('<strong>'+ repo[0].commit.committer.name + "</strong>" + repo[0].commit.message);
                                $widget.find('#commit_link').attr('href', repo[0].html_url);
                                $widget.find('.updated').html('Latest commit to the <strong>master</strong> branch on ' + updated_at);

                                console.log()
                        }
                });

        });

});
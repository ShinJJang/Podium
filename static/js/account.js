$(function(){
    $("#id_username").attr("placeholder","e-mail");
    $("#id_password").attr("placeholder","password");

    $("#signupForm").submit(function(){
        if(!$("#agree_eula").prop("checked")) {
            alert("이용약관에 동의해주십시오.")
            $("#agree_eula").focus();
            return false;
        }
        else if(!("#agree_privacy").prop("checked")) {
            alert("개인정보 보호정책에 동의해주십시오.")
            $("#agree_privacy").focus();
            return false;
        }
    });
});
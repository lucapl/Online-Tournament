import Cookies from 'js-cookie';

var UserProfile = (function() {
    var login = "";
    var sessionToken = "";

    var get = function() {
        return {login,sessionToken};
    };

    var set = function (email, token) {
        login = email;
        sessionToken = token;
    
        // Set cookies
        Cookies.set('userEmail', email);
        Cookies.set('sessionToken', token);
    };
    
    var clear = function () {
        // Clear cookies and reset values
        Cookies.remove('userEmail');
        Cookies.remove('sessionToken');
        login = "";
        sessionToken = "";
    };
    
      // Initialize with values from cookies if available
    if (Cookies.get('userEmail') && Cookies.get('sessionToken')) {
        login = Cookies.get('userEmail');
        sessionToken = Cookies.get('sessionToken');
    }
    
    return {
        get: get,
        set: set,
        clear: clear
    };
})();

export default UserProfile;
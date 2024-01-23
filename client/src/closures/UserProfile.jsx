import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

var UserProfile = (function() {
    var login = "";
    var sessionToken = "";

    var clear = function () {
        // Clear cookies and reset values
        Cookies.remove('userEmail');
        Cookies.remove('sessionToken');
        login = "";
        sessionToken = "";
    };
    

    var get = function() {
        if(!sessionToken){
            return {login,sessionToken};    
        }

        const decodedToken = jwtDecode(sessionToken);

        if (decodedToken.exp && Date.now() /1000 >= decodedToken.exp) {
            console.log("expired");
            clear();
        }
        return {login,sessionToken};
    };

    var set = function (email, token) {
        login = email;
        sessionToken = token;
    
        // Set cookies
        Cookies.set('userEmail', email);
        Cookies.set('sessionToken', token);
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
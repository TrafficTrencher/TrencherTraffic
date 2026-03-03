/* =====================================
   TRAFFIC TRENCHER APP CORE
===================================== */

/* ========= STREAM CONFIG ========= */

const STREAM_URL = ""; 
// paste Prism / Kick / YouTube stream here

const liveBadge = document.getElementById("liveBadge");

/* ========= LIVE STATUS ========= */

if (STREAM_URL && STREAM_URL.length > 5) {

    liveBadge.textContent = "LIVE";

    liveBadge.style.background =
        "linear-gradient(90deg,#ff003c,#ff5a5a)";

} else {

    liveBadge.textContent = "OFFLINE";
}


/* =====================================
   PROOF OF WORK — MILE TRACKER
===================================== */

const milesDisplay =
    document.getElementById("milesValue");

let miles =
    Number(localStorage.getItem("tt_miles")) || 0;

function updateMiles(){
    if(milesDisplay){
        milesDisplay.textContent = miles;
    }
}

updateMiles();


/* ADD MILES BUTTON */
window.addMiles = function(amount){

    miles += amount;

    localStorage.setItem(
        "tt_miles",
        miles
    );

    updateMiles();
};


/* RESET BUTTON */
window.resetMiles = function(){

    miles = 0;

    localStorage.setItem(
        "tt_miles",
        miles
    );

    updateMiles();
};


/* =====================================
   STREAM BUTTON
===================================== */

window.openStream = function(){

    if(!STREAM_URL){
        alert(
        "Add STREAM_URL inside app.js first."
        );
        return;
    }

    window.open(
        STREAM_URL,
        "_blank"
    );
};
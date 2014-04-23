: console-log { msg } :[ console.log(msg) ]; ;
: console-error { msg } :[ console.error(msg) ]; ;
: show-alert { msg } :[ alert(msg) ]; ;

: create-worker { id -- worker }
	:[ new Blob([document.querySelector(id).textContent], {type: "text/javascript"}) ]: { blob }
	:[ new Worker(window.URL.createObjectURL(blob)) ]: { worker }
	worker
;

: . ( string -- ) console-log ;
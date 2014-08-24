: console-log ( msg ) console.log(1) ;
: console-error ( msg ) console.error(1) ;
: show-alert ( msg ) alert(1) ;

: create-worker { id -- worker }
	:[ new Blob([document.querySelector(id).textContent], {type: "text/javascript"}) ]: { blob }
	:[ new Worker(window.URL.createObjectURL(blob)) ]: { worker }
	worker
;

: console-low-level-type { x -- }
	console-log
;

var func = {
  paginator: function (pagination, rout, params) {
  	var temp = ""
  	if(pagination.totalPages > 1){
      if(pagination.page) { 
          currentPage = Number(pagination.page)
        } else {
          currentPage = 1
      }
      var lower1 = currentPage-1
      var upper1 = currentPage+1
      
      if (!params) {
	      temp = temp + `<nav aria-label="Page navigation example" class="custom-pagination">
	        <ul class="pagination justify-content-center">`
	          if(currentPage == 1){
	            temp = temp + `<li class="page-item disabled"><a class="page-link">← Previous</a></li>`
	          } else {
	            temp = temp + `<li class="page-item"><a class="next_page page-link" rel="next" href="/`+ rout + `?page=`+ lower1 +`">← Previous</a> </li>`
	          }
	          for(var i=1; i<=pagination.totalPages; i++){
	            if(i == 1){
	              if(i == currentPage){
	                temp = temp + `<li class="page-item active"><a class="page-link">`+ i +`</a></li>`
	              } else {
	                temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`">`+ i +`</a></li>`
	              }
	            } else if(i>1 && i<pagination.totalPages) {
	              if((currentPage - 5) > 0){
	                if(i>1 && i<(currentPage - 5)){
	                  if(i == 2){
	                    temp = temp + `<li class="gap page-item"><a class="page-link">…</a></li>`
	                  }
	                } else if(i>=(currentPage - 5) && i<=currentPage){
	                  if(i == currentPage){
	                    temp = temp + `<li class="page-item active"><a class="page-link">`+ i +`</a></li>`
	                  } else {
	                    temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`">`+ i +`</a></li>`
	                  }
	                } else if((currentPage + 5) <= pagination.totalPages) {
	                  if(i>currentPage && i<=(currentPage + 5)){
	                    temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`">`+ i +`</a> </li>`
	                  } else if(currentPage + 6 == i){
	                    temp = temp + `<li class="gap page-item"><a class="page-link">…</a></li>`
	                  }
	                } else {
	                  if(i>currentPage && i<=pagination.totalPages){
	                    temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`">`+ i +`</a> </li>`
	                  }
	                }
	              } else {
	                if(pagination.totalPages > 10){
	                  if(i>1 && i<=10){
	                    if(i == currentPage){
	                      temp = temp + `<li class="page-item active"><a class="page-link">`+ i +`</a></li>`
	                    } else {
	                      temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`">`+ i +`</a> </li>`
	                    }
	                  } else if(i == 11){
	                    temp = temp + `<li class="gap page-item"><a class="page-link">…</a></li>`
	                  }
	                } else {
	                  if(i == currentPage){
	                    temp = temp + `<li class="page-item active"><a class="page-link">`+ i +`</a></li>`
	                  } else {
	                    temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`">`+ i +`</a> </li>`
	                  }
	                }
	              }
	            } else if(i == pagination.totalPages) {
	              if(i == currentPage){
	                temp = temp + `<li class="page-item active"><a class="page-link">`+ i +`</a></li>`
	              } else {
	                temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`">`+ i +`</a></li>`
	              }
	            }
	          }
	          if(currentPage == pagination.totalPages){
	            temp = temp + `<li class="page-item disabled"><a class="page-link">Next →</a></li>`
	          } else {
	            temp = temp + `<li class="page-item"><a class="next_page page-link" rel="next" href="/`+ rout + `?page=`+ upper1 +`">Next →</a></li>`
	          }
	        temp = temp + `</ul>
	      </nav>`
	    } else {
	    	temp = temp + `<nav aria-label="Page navigation example" class="custom-pagination">
	        <ul class="pagination justify-content-center">`
	          if(currentPage == 1){
	            temp = temp + `<li class="page-item disabled"><a class="page-link">← Previous</a></li>`
	          } else {
	            temp = temp + `<li class="page-item"><a class="next_page page-link" rel="next" href="/`+ rout + `?page=`+ lower1 +`&` + params + `">← Previous</a> </li>`
	          }
	          for(var i=1; i<=pagination.totalPages; i++){
	            if(i == 1){
	              if(i == currentPage){
	                temp = temp + `<li class="page-item active"><a class="page-link">`+ i +`</a></li>`
	              } else {
	                temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`&` + params + `">`+ i +`</a></li>`
	              }
	            } else if(i>1 && i<pagination.totalPages) {
	              if((currentPage - 5) > 0){
	                if(i>1 && i<(currentPage - 5)){
	                  if(i == 2){
	                    temp = temp + `<li class="gap page-item"><a class="page-link">…</a></li>`
	                  }
	                } else if(i>=(currentPage - 5) && i<=currentPage){
	                  if(i == currentPage){
	                    temp = temp + `<li class="page-item active"><a class="page-link">`+ i +`</a></li>`
	                  } else {
	                    temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`&` + params + `">`+ i +`</a></li>`
	                  }
	                } else if((currentPage + 5) <= pagination.totalPages) {
	                  if(i>currentPage && i<=(currentPage + 5)){
	                    temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`&` + params + `">`+ i +`</a> </li>`
	                  } else if(currentPage + 6 == i){
	                    temp = temp + `<li class="gap page-item"><a class="page-link">…</a></li>`
	                  }
	                } else {
	                  if(i>currentPage && i<=pagination.totalPages){
	                    temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`&` + params + `">`+ i +`</a> </li>`
	                  }
	                }
	              } else {
	                if(pagination.totalPages > 10){
	                  if(i>1 && i<=10){
	                    if(i == currentPage){
	                      temp = temp + `<li class="page-item active"><a class="page-link">`+ i +`</a></li>`
	                    } else {
	                      temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`&` + params + `">`+ i +`</a> </li>`
	                    }
	                  } else if(i == 11){
	                    temp = temp + `<li class="gap page-item"><a class="page-link">…</a></li>`
	                  }
	                } else {
	                  if(i == currentPage){
	                    temp = temp + `<li class="page-item active"><a class="page-link">`+ i +`</a></li>`
	                  } else {
	                    temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`&` + params + `">`+ i +`</a> </li>`
	                  }
	                }
	              }
	            } else if(i == pagination.totalPages) {
	              if(i == currentPage){
	                temp = temp + `<li class="page-item active"><a class="page-link">`+ i +`</a></li>`
	              } else {
	                temp = temp + `<li class="page-item"><a class="page-link" href="/`+ rout + `?page=`+ i +`&` + params + `">`+ i +`</a></li>`
	              }
	            }
	          }
	          if(currentPage == pagination.totalPages){
	            temp = temp + `<li class="page-item disabled"><a class="page-link">Next →</a></li>`
	          } else {
	            temp = temp + `<li class="page-item"><a class="next_page page-link" rel="next" href="/`+ rout + `?page=`+ upper1 +`&` + params + `">Next →</a></li>`
	          }
	        temp = temp + `</ul>
	      </nav>`
	    }
    }

  	return temp;
  }
}

module.exports = func;
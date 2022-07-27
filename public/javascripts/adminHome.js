$(document).ready( function () {
    $('#table_id').DataTable();
} );


      
  


    function incCart(proId) {
        console.log(proId)
        $.ajax({
              url: '/incCart/' + proId,
              method: 'post',
              success: (response) => {
                  SVGDefsElement
          }
      })
  }

// 显示 loading 浮层
function showLoading(text, duration = 0, callback = () => {}) {

  $('#loading').show();

  $('.loading-overlay').css('display', 'block');

  $('.loading-spinner span').text(text || 'Loading...');
  $('.loading-spinner i').css('display', 'inline-block');

  if (duration) {

    $('.loading-overlay').css('display', 'none');
    $('.loading-spinner i').css('display', 'none');

    setTimeout(function() {

      $('#loading').hide();

      callback()

    }, duration)

  }
}

// 隐藏 loading 浮层
function hideLoading() {

  $('#loading').hide();

}

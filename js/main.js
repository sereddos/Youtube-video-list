'use strict';

// Получаем id из URL
const params = window.location.search.replace('?id=','').split(',');

// Проверем id на длину и символы
const resultParams = params.filter(function(number) {
  return number.length === 11 && /^[ A-Za-z0-9_-]*$/.test(number);
});

// Получаем елемент для вставки в него списка видео
const videoWrap = document.getElementById('youtube');

// Для каждого id получаем данные
for (let i=0; i < resultParams.length; i++) {
  // Создаем нужные елементы
  const videoItem = document.createElement('div');
  const videoItemWrap = document.createElement('div');
  const videoItemTitle = document.createElement('div');
  videoItem.setAttribute('class', 'video__item');
  videoItemWrap.setAttribute('class', 'video__item-wrap');
  videoItemTitle.setAttribute('class', 'video__item-title');

  // Устанавливаем изображение-постер для видео
  videoItemWrap.style.backgroundImage = 'url(http://i.ytimg.com/vi/' + resultParams[i] + '/hqdefault.jpg)';

  // Устанавливаем URL для видео
  const videParamsUrl = 'http://noembed.com/embed?url=https://www.youtube.com/watch?v=' + resultParams[i];

  // Получаем массви данных о видео
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const myArr = JSON.parse(this.responseText);
      videoItemTitle.innerText = myArr.title;
    }
  };
  xmlhttp.open('GET', videParamsUrl, true);
  xmlhttp.send();

  /*
  fetch(videParamsUrl, {
    method: 'POST'
  }).then(function (response) {
    return response.json();
  }).then(function (response) {
    videoItemTitle.innerText = response.title;
  });
  */

  // Вставляем елементы в DOM
  videoItemWrap.appendChild(videoItemTitle);
  videoItem.appendChild(videoItemWrap);
  videoWrap.appendChild(videoItem);

  // Обрабатываем клик по изображению-постеру - добавляем видео
  videoItem.onclick = function() {
    // Выбираем активный елемент
    const activeItem = this.parentNode.querySelector('.active');

    // Если елемент активный, ставим его на паузу
    if (activeItem) {
      activeItem.classList.remove('active');
      const iframeActive = activeItem.getElementsByTagName('iframe')[0].contentWindow;
      toggleVideo('pause', iframeActive);
    }

    // Если елемент уже содержит iframe, запускаем просмотр видео
    if (this.classList.contains('iframe')) {
      this.classList.toggle("active");
      toggleVideo('play', this.getElementsByTagName('iframe')[0].contentWindow);
    } else {
      // Создаем iFrame и сразу начинаем проигрывать видео
      this.classList += ' active iframe';
      const iframe = document.createElement('iframe');

      // Устанавливаем URL и атрибуты для iframe
      const iframe_url = 'https://www.youtube.com/embed/' + resultParams[i] + '?enablejsapi=1&autoplay=1';
      iframe.setAttribute('src', iframe_url);
      iframe.setAttribute('frameborder','0');

      // Добавляем iframe в блок на страницу и запускаем видео
      this.prepend(iframe);
      toggleVideo('play', iframe.contentWindow);
    }
  }
}

function toggleVideo(state, iframe) {
  const action = state == 'play' ? 'playVideo' : 'pauseVideo';
  iframe.postMessage('{"event":"command","func":"' + action + '","args":""}','*');
}
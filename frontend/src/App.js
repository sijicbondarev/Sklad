import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

// Images
const IMAGES = {
  PRODUCTION_GIF: 'https://images.unsplash.com/photo-1576280314550-773c50583407',
  SKLAD_PNG: 'https://images.unsplash.com/photo-1530480667809-b655d4dc3aaa',
  SKLAD_GIF: 'https://images.unsplash.com/photo-1612544409025-e1f6a56c1152',
  PORTFOLIO_1: 'https://images.unsplash.com/photo-1632187989763-c9c620420b4d',
  PORTFOLIO_2: 'https://images.unsplash.com/photo-1524834671419-aa7d41c1c657',
  PORTFOLIO_3: 'https://images.unsplash.com/photo-1716835018054-5b13e5ef53b0',
  PORTFOLIO_4: 'https://images.unsplash.com/photo-1729959884778-da26e3896ed7',
  PORTFOLIO_5: 'https://images.unsplash.com/photo-1632187989763-c9c620420b4d',
  PORTFOLIO_6: 'https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b',
  PUBLIC_CR: 'https://images.unsplash.com/photo-1548450847-8a9a5cc3968f'
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [theme, setTheme] = useState('light-theme');
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);
  const [responseText, setResponseText] = useState('Добро пожаловать! Пожалуйста, введите ваш запрос.');
  const [isTyping, setIsTyping] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  
  // For calculator
  const [timing, setTiming] = useState(1); // Default: 20 seconds
  const [dueDate, setDueDate] = useState(3); // Default: more than a month
  const [videoType, setVideoType] = useState('Видео');
  const [graphicsType, setGraphicsType] = useState('Съемка');
  const [purposeType, setPurposeType] = useState('Закрытый');
  const [hasActor, setHasActor] = useState(false);
  const [hasSpeaker, setHasSpeaker] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [totalPrice, setTotalPrice] = useState(500);
  
  // Timing options
  const timingParams = [50000, 250, 500, 1000, 1500, 2000, 3000, 3100, 3200, 3300, 3400, 3500, 3600, 37000, 38000, 39000, 50000];
  const timingValues = ["Фильм", "20 секунд", "30 секунд", "40 секунд", "50 секунд", "1 минута", "1,5 минуты", "2 минуты", "3 минуты", "4 минуты", "5 минут", "6 минут", "7 минут", "8 минут", "9 минут", "10 минут", "Фильм"];
  
  // Due date options
  const dueDateParams = [10, 5, 0.5, 0];
  const dueDateValues = ["Неделя", "2 недели", "Месяц", "Больше месяца"];

  useEffect(() => {
    // Check if user has visited before
    const visited = localStorage.getItem('hasVisitedBefore');
    if (visited) {
      setHasVisitedBefore(true);
      typeText("Здравствуйте! Спасибо, что вернулись. Чем могу помочь?");
    } else {
      localStorage.setItem('hasVisitedBefore', 'true');
      typeText("Добро пожаловать! Пожалуйста, введите ваш запрос.");
    }
    
    // Check theme preference
    if (localStorage.theme === 'inverted') {
      document.documentElement.classList.add('inverted');
      setTheme('dark-theme');
    }
    
    // Test backend connection
    const helloWorldApi = async () => {
      try {
        const response = await axios.get(`${API}/`);
        console.log(response.data.message);
      } catch (e) {
        console.error(e, `errored out requesting / api`);
      }
    };
    
    helloWorldApi();
  }, []);
  
  useEffect(() => {
    // Calculate price whenever parameters change
    calculatePrice();
  }, [timing, dueDate, videoType, graphicsType, purposeType, hasActor, hasSpeaker, hasLocation]);
  
  const calculatePrice = () => {
    // Base price from timing
    let price = timingParams[timing];
    
    // Adjustments from due date
    price = price * (1 + dueDateParams[dueDate]);
    
    // Adjustments from video type
    const videoTypeMultipliers = {
      'Видео': 0,
      'Реклама': 1.5,
      'Обзор': -0.6,
      'Имидж': 0.5,
      'Вирус': 5,
      'Обучение': -0.7,
      'Другое': 0.9
    };
    price = price * (1 + (videoTypeMultipliers[videoType] || 0));
    
    // Adjustments from graphics type
    const graphicsTypeMultipliers = {
      'Съемка': 0,
      'Анимация': -1,
      '3D': 3,
      'Съемка + анимация': 0.7,
      'Съемка + 3D': 3.7
    };
    price = price * (1 + (graphicsTypeMultipliers[graphicsType] || 0));
    
    // Adjustments from purpose type
    const purposeTypeMultipliers = {
      'Закрытый': 1,
      'Digital': 1.5,
      'ТВ': 5
    };
    price = price * (1 + (purposeTypeMultipliers[purposeType] || 0));
    
    // Additional features
    if (hasActor) price = price * 1.2;
    if (hasSpeaker) price = price * 1.1;
    if (hasLocation) price = price * 1.2;
    
    // Ensure minimum price
    price = Math.max(price, 300);
    
    setTotalPrice(Math.round(price));
  };
  
  const toggleTheme = () => {
    const newTheme = theme === 'light-theme' ? 'dark-theme' : 'light-theme';
    setTheme(newTheme);
    document.body.className = newTheme;
    
    if (newTheme === 'dark-theme') {
      document.documentElement.classList.add('inverted');
      localStorage.theme = 'inverted';
    } else {
      document.documentElement.classList.remove('inverted');
      localStorage.theme = '';
    }
  };
  
  const toggleNavigation = () => {
    setNavigationOpen(!navigationOpen);
  };
  
  const typeText = (text, callback) => {
    setIsTyping(true);
    setResponseText('');
    
    let i = 0;
    const typeInterval = setInterval(() => {
      setResponseText(prev => prev + text.charAt(i));
      i++;
      
      if (i === text.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
        if (callback) callback();
      }
    }, 30);
  };
  
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    const queryInput = document.getElementById('bd-query');
    const query = queryInput.value.trim();
    
    if (!query) {
      alert("Пожалуйста, введите запрос!");
      return;
    }
    
    // Show "typing" indicator in the response container
    setResponseText("Отправка запроса...");
    
    try {
      // Use our backend API instead of direct Telegram API call
      const apiResponse = await axios.post(`${API}/send-telegram`, {
        chat_id: '542053490',
        text: `Новый запрос от пользователя:\n${query}`
      });
      
      if (!apiResponse.data.success) {
        throw new Error(`Ошибка API: ${apiResponse.data.message}`);
      }
      
      // Simulate response
      const simulatedResponse = `Ответ от бота: Ваш запрос "${query}" обработан успешно!`;
      
      // Type the response
      typeText(simulatedResponse, () => {
        setTimeout(() => {
          // After response, show company info
          const productionText = `
Sklad Production — это независимый кинопродакшн, который занимается созданием рекламных роликов, кино и телесериалов. Мы предлагаем полный цикл услуг, начиная от разработки идеи и сценария до финальной постпродакшн обработки. Наша команда состоит из опытных продюсеров, режиссеров, операторов и монтажеров, которые работают с использованием новейших технологий и оборудования.

Мы специализируемся на съемках рекламных роликов для крупных брендов и стартапов, а также на создании оригинальных проектов для телевидения и цифровых платформ. В Sklad Production мы ценим креативность, внимание к деталям и стремимся создавать качественные и эмоциональные фильмы, которые оставляют след в сознании зрителей.

На протяжении многих лет мы успешно реализовывали проекты, включая международные кампании и участие в кинофестивалях. Мы гордимся нашей работой и всегда открыты для новых идей и вызовов.

Наши услуги включают:
- Разработка концепции и сценария
- Продюсирование и координация съемочного процесса
- Операторская работа
- Монтаж и цветокоррекция
- Постпродакшн и спецэффекты

Присоединяйтесь к нам и станьте частью удивительных проектов, которые изменят взгляд на рекламу и кино.
`;
          
          // Break text into chunks and display sequentially
          const textChunks = productionText.split('\n\n');
          let chunkIndex = 0;
          
          function displayChunk() {
            if (chunkIndex >= textChunks.length) return;
            
            const chunk = textChunks[chunkIndex];
            typeText(chunk, () => {
              chunkIndex++;
              if (chunkIndex < textChunks.length) {
                setTimeout(displayChunk, 800);
              }
            });
          }
          
          displayChunk();
        }, 1000);
      });
      
    } catch (error) {
      console.error('Error sending message to Telegram:', error);
      typeText("Произошла ошибка при отправке запроса. Попробуйте позже.");
    }
    
    // Clear input field
    queryInput.value = '';
  };
  
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    // Get form data
    const name = document.querySelector('input[name="name"]').value;
    const contacts = document.querySelector('input[name="contacts"]').value;
    
    if (!name || !contacts) {
      alert("Пожалуйста, заполните все обязательные поля!");
      return;
    }
    
    // Create form data object
    const formData = {
      timing_value: timingValues[timing],
      due_date_value: dueDateValues[dueDate],
      video_type: videoType,
      graphics: graphicsType,
      purpose: purposeType,
      actor: hasActor,
      speaker: hasSpeaker,
      location: hasLocation,
      name: name,
      contacts: contacts,
      total: totalPrice
    };
    
    try {
      // Submit through our backend API
      const response = await axios.post(`${API}/order`, formData);
      
      if (!response.data.success) {
        throw new Error('API returned error');
      }
      
      // Show success message
      const formBlock = document.querySelector('.form-block.form-main');
      const successBlock = document.querySelector('.form-block.form-success');
      
      if (formBlock && successBlock) {
        formBlock.style.display = 'none';
        successBlock.style.display = 'block';
      } else {
        alert('Спасибо! Скоро мы свяжемся с вами для уточнения всех подробностей.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
      
      // Show failure message
      const formBlock = document.querySelector('.form-block.form-main');
      const failureBlock = document.querySelector('.form-block.form-failure');
      
      if (formBlock && failureBlock) {
        formBlock.style.display = 'none';
        failureBlock.style.display = 'block';
      }
    }
  };
  
  return (
    <div className={`App ${theme}`}>
      {/* Header */}
      <header className="header grid ba">
        <a className="header-home b" href="index.html" aria-label="Homepage">SKLAD.PRODUCTION</a>
        <nav className="menu grid b">
          <button className="menu-item scheme-toggle b" title="Change color scheme" role="presentation" onClick={toggleTheme}></button>
          <button className="menu-item b js-menu-btn" onClick={toggleNavigation}>Menu</button>
        </nav>
      </header>
      
      {/* Navigation Menu */}
      <div className={`navigation grid ba ${navigationOpen ? 'active' : ''}`}>
        <div className="navigation-header">
          <form className="navigation-search b" id="search-form" onSubmit={handleQuerySubmit}>
            <input className="search-input b" id="s" name="s" type="text" placeholder="Search for something minimal…" />
            <input type="submit" className="search-submit b" value="→" />
          </form>
          <a className="navigation-search-link b" href="#search">Search</a>
          <button className="navigation-button b js-menu-btn" onClick={toggleNavigation}>Close</button>
        </div>
        
        <div id="response"></div>
        
        <div className="navigation-about b" data-md>
          <p>Sklad Production — это независимый кинопродакшн, который занимается созданием рекламных роликов, кино и телесериалов в Казахстане. Мы предлагаем полный цикл услуг от разработки идеи до финальной обработки.</p>
          <p>Наша команда состоит из опытных профессионалов, которые работают с использованием новейших технологий и оборудования.</p>
          <p>Свяжитесь с нами, чтобы обсудить ваш проект и стать частью удивительных историй, которые мы создаем.</p>
        </div>
        
        <div className="navigation-links b" id="navigation-links" style={{
          backgroundImage: `url(${IMAGES.PRODUCTION_GIF})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          filter: 'grayscale(50%) brightness(100%) contrast(90%)'
        }}>
          <a className="navigation-link b" href="#"></a>
        </div>
        
        <div className="navigation-categories b">
          <a className="navigation-link ba" href="#architecture">Рекламные ролики</a>
          <a className="navigation-link ba" href="#furniture">Музыкальные клипы</a>
          <a className="navigation-link ba" href="#interiors">Корпоративное видео</a>
          <a className="navigation-link ba" href="#homewares">Документальные фильмы</a>
          <a className="navigation-link ba" href="#lighting">Кино и сериалы</a>
          <a className="navigation-link ba" href="#technology">Аэросъемка</a>
          <a className="navigation-link ba" href="#art">Анимация и 3D</a>
          <a className="navigation-link ba" href="#wearables">Постпродакшн</a>
        </div>
      </div>
      
      {/* Main Banner */}
      <div className="page-title b grid" id="page-title" style={{
        backgroundImage: `url(${IMAGES.SKLAD_GIF})`,
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        filter: 'grayscale(50%) brightness(100%) contrast(90%)'
      }}>
        <h1 className="page-title-text"></h1>
      </div>
      
      {/* Response Container */}
      <div className="spacer" id="response-container" style={{
        minHeight: '50px',
        width: '90%',
        margin: '20px auto',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        fontFamily: '"Courier New", Courier, monospace',
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        wordWrap: 'break-word',
        borderRadius: '8px',
      }}>
        {responseText}
      </div>
      
      {/* Newsletter Section (Repurposed for Query Form) */}
      <section className="nl grid b">
        <h1 className="nl-title b">FILM & VIDEO PRODUCTION SERVICES IN KAZAKHSTAN</h1>
        <form className="nl-form embeddable-buttondown-form" id="subscribe-form" onSubmit={handleQuerySubmit}>
          <textarea id="bd-query" name="query" className="nl-input b" placeholder="Введите ваш запрос..." required></textarea>
          <label className="nl-label" htmlFor="bd-query">Ваш запрос</label>
          <input type="hidden" value="1" name="embed" />
          <button type="submit" className="nl-btn b">ОТПРАВИТЬ</button>
        </form>
        <div className="nl-text b">
          {/* Order Section */}
          <div className="custom-wrapper">
            <div className="layout" id="layout">
              <section className="section section-ha" data-anchor="order" id="order-section">
                <div className="section-inner">
                  <div className="title">
                    <h2 style={{fontFamily: '"Roboto", sans-serif'}}>Заказать</h2>
                  </div>
                  <form action="" className="form form-valid" id="order-form" method="post" noValidate onSubmit={handleOrderSubmit}>
                    <div className="cols cols-h-stretch">
                      <div className="col col-m">
                        <div className="form-block form-filters">
                          <div className="form-block-inner">
                            <div className="row row-w-cells">
                              <div className="cell cell-m">
                                <div className="range">
                                  <div className="range-label">
                                    <h4 style={{fontFamily: '"Roboto", sans-serif !important'}}>ХРОНОМЕТРАЖ</h4>
                                    <span className="output">{timingValues[timing]}</span>
                                  </div>
                                  <input type="hidden" name="timing-param" value={timingParams[timing]} />
                                  <input type="hidden" name="timing-value" value={timingValues[timing]} />
                                  <input 
                                    type="range" 
                                    value={timing} 
                                    onChange={(e) => setTiming(parseInt(e.target.value))} 
                                    aria-label="Хронометраж" 
                                    id="timing" 
                                    max="16" 
                                    min="0" 
                                    step="1" 
                                  />
                                </div>
                              </div>
                              <div className="cell cell-m">
                                <div className="range">
                                  <div className="range-label">
                                    <h4>Срок</h4>
                                    <div className="output">{dueDateValues[dueDate]}</div>
                                  </div>
                                  <input type="hidden" name="due-date-param" value={dueDateParams[dueDate]} />
                                  <input type="hidden" name="due-date-value" value={dueDateValues[dueDate]} />
                                  <input 
                                    type="range" 
                                    value={dueDate} 
                                    onChange={(e) => setDueDate(parseInt(e.target.value))} 
                                    aria-label="Срок" 
                                    id="due-date" 
                                    max="3" 
                                    min="0" 
                                    step="1" 
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <h4>Тип видео</h4>
                              <input type="hidden" name="video-type" value={videoType} data-param="0" />
                              <label className="radio">
                                <input 
                                  type="radio" 
                                  name="video-type" 
                                  value="Видео" 
                                  data-param="0" 
                                  checked={videoType === 'Видео'} 
                                  onChange={() => setVideoType('Видео')} 
                                />
                                <span>Видео</span>
                              </label>
                              <label className="radio">
                                <input 
                                  type="radio" 
                                  name="video-type" 
                                  value="Реклама" 
                                  data-param="1.5" 
                                  checked={videoType === 'Реклама'} 
                                  onChange={() => setVideoType('Реклама')} 
                                />
                                <span>Рекламный</span>
                              </label>
                              <label className="radio">
                                <input 
                                  type="radio" 
                                  name="video-type" 
                                  value="Обзор" 
                                  data-param="-0.6" 
                                  checked={videoType === 'Обзор'} 
                                  onChange={() => setVideoType('Обзор')} 
                                />
                                <span>Обзорный</span>
                              </label>
                              <label className="radio">
                                <input 
                                  type="radio" 
                                  name="video-type" 
                                  value="Имидж" 
                                  data-param="0.5" 
                                  checked={videoType === 'Имидж'} 
                                  onChange={() => setVideoType('Имидж')} 
                                />
                                <span>Имиджевый</span>
                              </label>
                              <label className="radio">
                                <input 
                                  type="radio" 
                                  name="video-type" 
                                  value="Вирус" 
                                  data-param="5" 
                                  checked={videoType === 'Вирус'} 
                                  onChange={() => setVideoType('Вирус')} 
                                />
                                <span>Вирусный</span>
                              </label>
                              <label className="radio">
                                <input 
                                  type="radio" 
                                  name="video-type" 
                                  value="Обучение" 
                                  data-param="-0.7" 
                                  checked={videoType === 'Обучение'} 
                                  onChange={() => setVideoType('Обучение')} 
                                />
                                <span>Обучение</span>
                              </label>
                              <label className="radio">
                                <input 
                                  type="radio" 
                                  name="video-type" 
                                  value="Другое" 
                                  data-param="0.9" 
                                  checked={videoType === 'Другое'} 
                                  onChange={() => setVideoType('Другое')} 
                                />
                                <span>Фильм</span>
                              </label>
                            </div>
                            <div className="row row-w-cells">
                              <div className="cell">
                                <h4>Тип производства</h4>
                                <label className="radio">
                                  <input 
                                    type="radio" 
                                    name="graphics" 
                                    value="Съемка" 
                                    data-param="0" 
                                    checked={graphicsType === 'Съемка'} 
                                    onChange={() => setGraphicsType('Съемка')} 
                                  />
                                  <span>Съемка</span>
                                </label>
                                <label className="radio">
                                  <input 
                                    type="radio" 
                                    name="graphics" 
                                    value="Анимация" 
                                    data-param="-1" 
                                    checked={graphicsType === 'Анимация'} 
                                    onChange={() => setGraphicsType('Анимация')} 
                                  />
                                  <span>Анимация</span>
                                </label>
                                <label className="radio">
                                  <input 
                                    type="radio" 
                                    name="graphics" 
                                    value="3D" 
                                    data-param="3" 
                                    checked={graphicsType === '3D'} 
                                    onChange={() => setGraphicsType('3D')} 
                                  />
                                  <span>3D</span>
                                </label>
                                <label className="radio">
                                  <input 
                                    type="radio" 
                                    name="graphics" 
                                    value="Съемка + анимация" 
                                    data-param="0.7" 
                                    checked={graphicsType === 'Съемка + анимация'} 
                                    onChange={() => setGraphicsType('Съемка + анимация')} 
                                  />
                                  <span>Съемка + анимация</span>
                                </label>
                                <label className="radio">
                                  <input 
                                    type="radio" 
                                    name="graphics" 
                                    value="Съемка + 3D" 
                                    data-param="3.7" 
                                    checked={graphicsType === 'Съемка + 3D'} 
                                    onChange={() => setGraphicsType('Съемка + 3D')} 
                                  />
                                  <span>Съемка + 3D</span>
                                </label>
                              </div>
                              <div className="cell">
                                <h4>Размещение</h4>
                                <label className="radio">
                                  <input 
                                    type="radio" 
                                    name="purpose" 
                                    value="Закрытый" 
                                    data-param="1" 
                                    checked={purposeType === 'Закрытый'} 
                                    onChange={() => setPurposeType('Закрытый')} 
                                  />
                                  <span>Закрытый</span>
                                </label>
                                <label className="radio">
                                  <input 
                                    type="radio" 
                                    name="purpose" 
                                    value="Digital" 
                                    data-param="1.5" 
                                    checked={purposeType === 'Digital'} 
                                    onChange={() => setPurposeType('Digital')} 
                                  />
                                  <span>Digital</span>
                                </label>
                                <label className="radio">
                                  <input 
                                    type="radio" 
                                    name="purpose" 
                                    value="ТВ" 
                                    data-param="5" 
                                    checked={purposeType === 'ТВ'} 
                                    onChange={() => setPurposeType('ТВ')} 
                                  />
                                  <span>Кинопрокат</span>
                                </label>
                              </div>
                            </div>
                            <div className="row">
                              <label className="checkbox">
                                <input 
                                  type="checkbox" 
                                  name="actor" 
                                  value="Да" 
                                  data-param="0.2" 
                                  checked={hasActor} 
                                  onChange={() => setHasActor(!hasActor)} 
                                />
                                <span className="checkbox-label">Актеры, модели</span>
                                <span className="checkbox-switch"></span>
                              </label>
                              <label className="checkbox">
                                <input 
                                  type="checkbox" 
                                  name="speaker" 
                                  value="Да" 
                                  data-param="0.1" 
                                  checked={hasSpeaker} 
                                  onChange={() => setHasSpeaker(!hasSpeaker)} 
                                />
                                <span className="checkbox-label">Диктор</span>
                                <span className="checkbox-switch"></span>
                              </label>
                              <label className="checkbox">
                                <input 
                                  type="checkbox" 
                                  name="location" 
                                  value="Да" 
                                  data-param="0.2" 
                                  checked={hasLocation} 
                                  onChange={() => setHasLocation(!hasLocation)} 
                                />
                                <span className="checkbox-label">Локации</span>
                                <span className="checkbox-switch"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col col-m">
                        <div className="form-block form-main">
                          <div className="form-block-inner">
                            <h3>Закажите видео за <span className="price price-ru">{totalPrice}</span>$</h3>
                            <input type="hidden" name="type" value="order" />
                            <input type="hidden" name="total" value={totalPrice} data-total="ru" />
                            <input type="hidden" name="cur" value="₽" />
                            
                            <div className="form-row form-row-w-cells">
                              <div className="form-cell">
                                <input type="text" name="name" className="required name" required aria-label="Имя" />
                                <label htmlFor="name">Имя</label>
                                <p className="p-s error-msg">Как вас зовут?</p>
                              </div>
                              <div className="form-cell">
                                <input type="text" name="contacts" className="required contacts" required aria-label="Телефон или почта" />
                                <label htmlFor="contacts">Контакт</label>
                                <p className="p-s error-msg">Введите номер телефона или адрес электронной почты.</p>
                              </div>
                            </div>
                            
                            <input type="submit" value="Отправить" id="form-btn" className="btn" />
                          </div>
                        </div>
                        
                        <div className="notes">
                          <p className="p-s">Предложение не является публичной офертой.</p>
                        </div>
                        
                        <div className="form-block form-success" style={{ display: 'none' }}>
                          <div className="form-block-inner">
                            <h3>Спасибо</h3>
                            <p className="p-l">Скоро мы свяжемся с вами для уточнения всех подробностей.</p>
                            <a className="link-w-arrow send-form-again">
                              <span>Отправить еще раз</span>
                              <svg viewBox="0 0 8 12">
                                <use xlinkHref="#arrow-right"></use>
                              </svg>
                            </a>
                          </div>
                        </div>
                        
                        <div className="form-block form-failure" style={{ display: 'none' }}>
                          <div className="form-block-inner">
                            <h3>Ошибка</h3>
                            <p className="p-l">Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.</p>
                            <a className="link-w-arrow send-form-again">
                              <span>Отправить еще раз</span>
                              <svg viewBox="0 0 8 12">
                                <use xlinkHref="#arrow-right"></use>
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
      
      {/* Portfolio Grid */}
      <div className="grid grid-thumbs ba grid-home grid-infinite">
        <article className="thumb b">
          <a className="thumb-content" href="/articles/reklama-astana-bank.html" rel="noreferrer" aria-label="View Feature">
            <h1 className="thumb-title">Рекламный ролик для Astana Bank</h1>
            <h2 className="thumb-subtitle">Корпоративное видео</h2>
            <figure className="thumb-container">
              <img className="thumbnail-image" src={IMAGES.PORTFOLIO_1} alt="" loading="lazy" />
            </figure>
          </a>
        </article>
        
        <article className="thumb b">
          <a className="thumb-content" href="/articles/muzykalniy-klip-step.html" rel="noreferrer" aria-label="View Feature">
            <h1 className="thumb-title">Музыкальный клип "Степь"</h1>
            <h2 className="thumb-subtitle">Музыкальное видео</h2>
            <figure className="thumb-container">
              <img className="thumbnail-image" src={IMAGES.PORTFOLIO_2} alt="" loading="lazy" />
            </figure>
          </a>
        </article>
        
        <article className="thumb b">
          <a className="thumb-content" href="#" rel="noreferrer" aria-label="View Feature">
            <h1 className="thumb-title">Документальный фильм "Великий Шелковый путь"</h1>
            <h2 className="thumb-subtitle">Исторический фильм</h2>
            <figure className="thumb-container">
              <img className="thumbnail-image" src={IMAGES.PORTFOLIO_3} alt="" loading="lazy" />
            </figure>
          </a>
        </article>
        
        <article className="thumb b">
          <a className="thumb-content" href="#" rel="noreferrer" aria-label="View Feature">
            <h1 className="thumb-title">Аэросъемка для National Geographic</h1>
            <h2 className="thumb-subtitle">Природная съемка</h2>
            <figure className="thumb-container">
              <img className="thumbnail-image" src={IMAGES.PORTFOLIO_4} alt="" loading="lazy" />
            </figure>
          </a>
        </article>
        
        <article className="thumb b">
          <a className="thumb-content" href="#" rel="noreferrer" aria-label="View Feature">
            <h1 className="thumb-title">Корпоративное видео для KazMunayGas</h1>
            <h2 className="thumb-subtitle">Промышленное видео</h2>
            <figure className="thumb-container">
              <img className="thumbnail-image" src={IMAGES.PORTFOLIO_5} alt="" loading="lazy" />
            </figure>
          </a>
        </article>
        
        <article className="thumb b">
          <a className="thumb-content" href="#" rel="noreferrer" aria-label="View Feature">
            <h1 className="thumb-title">Имиджевый ролик Казахстан 2025</h1>
            <h2 className="thumb-subtitle">Туристический ролик</h2>
            <figure className="thumb-container">
              <img className="thumbnail-image" src={IMAGES.PORTFOLIO_6} alt="" loading="lazy" />
            </figure>
          </a>
        </article>
      </div>
      
      {/* Footer */}
      <footer className="footer grid">
        <div className="footer-column">
          <img src={IMAGES.PUBLIC_CR} alt="Sklad Production" style={{ filter: 'grayscale(50%) brightness(100%) contrast(90%)' }} />
          <h2>SKLAD.PRODUCKTION ® We store a huge number of creative ideas in our warehouse. Just take them.</h2>
          <div className="footer-about"></div>
        </div>
        
        <dl className="footer-column">
          <dt>NAVIGATE</dt>
          <dd><a href="#about">О нас</a></dd>
          <dd><a href="#suggest">Предложить проект</a></dd>
          <dd><a href="#contact">Контакты</a></dd>
          <dd><a href="#privacy">Политика конфиденциальности</a></dd>
        </dl>
        
        <dl className="footer-column">
          <dt>СВЯЗАТЬСЯ С НАМИ</dt>
          <dd><a target="_blank" href="https://twitter.com" rel="noreferrer">Twitter</a></dd>
          <dd><a target="_blank" href="https://instagram.com" rel="noreferrer">Instagram</a></dd>
          <dd><a target="_blank" href="https://t.me/" rel="noreferrer">Telegram</a></dd>
          <dd><a target="_blank" href="https://facebook.com" rel="noreferrer">Facebook</a></dd>
        </dl>
      </footer>
    </div>
  );
}

export default App;

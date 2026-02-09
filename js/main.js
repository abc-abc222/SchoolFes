/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';
	
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. SVGファイル読み込み
    const svgResp_level1 = await fetch("../map-data/level1.svg");
    const svgResp_level2 = await fetch("../map-data/level2.svg");
    const svgResp_level3 = await fetch("../map-data/level3.svg");
    const svgResp_level4 = await fetch("../map-data/level4.svg");
    document.getElementById("map-level1").innerHTML = await svgResp_level1.text();
    document.getElementById("map-level2").innerHTML = await svgResp_level2.text();
    document.getElementById("map-level3").innerHTML = await svgResp_level3.text();
    document.getElementById("map-level4").innerHTML = await svgResp_level4.text();

    // 2. JSONコンテンツ挿入
    if (window.insertContentFromJSON) {
		await window.insertContentFromJSON('.content__inner', '../map-data/content.json');
		await window.insertListFromJSON('.list', '../map-data/content.json');
	  
		// リストを取得
		spaces = Array.from(spacesEl.querySelectorAll('.list__item > a.list__link'));

		// ここでクリックイベントを追加
		spaces.forEach(function(space) {
			const spaceItem = space.parentNode;
			const level = spaceItem.dataset.level;
			const spacerefval = spaceItem.dataset.space;

			space.addEventListener('click', function(ev) {
				ev.preventDefault();
				// 小さい画面なら検索バーを閉じる
				closeSearch();
				// 該当レベルを開く
				showLevel(Number(level));
				// ピン/コンテンツを開く
				openContent(spacerefval);
			});
		});
    }

    // 3. List.js の初期化（リストが存在する場合のみ）
    if (spacesEl.querySelectorAll('.list__item').length > 0) {
      spacesList = new List('spaces-list', {
        valueNames: ['list__link', { data: ['level'] }, { data: ['category'] }]
      });
	  // 初期状態：カテゴリ順で並び替え
	  spacesList.sort('category');
	  classie.add(spacesEl, 'grouped-by-category');
    } else {
      console.warn('spacesList: 初期化用アイテムが存在しません');
    }

    // 4. ピン生成（コンテンツ生成後に実行）
    await loadPins();

  } catch (err) {
    console.error("初期化エラー:", err);
  }
});

async function loadPins() {
  try {
    const response_level1 = await fetch("../map-data/pins-level1.json");
    const response_level2 = await fetch("../map-data/pins-level2.json");
    const response_level3 = await fetch("../map-data/pins-level3.json");
    const response_level4 = await fetch("../map-data/pins-level4.json");
    const pinsData_level1 = await response_level1.json();
    const pinsData_level2 = await response_level2.json();
    const pinsData_level3 = await response_level3.json();
    const pinsData_level4 = await response_level4.json();

    // ピンを生成
    renderPins(".level1__pins",pinsData_level1);
    renderPins(".level2__pins",pinsData_level2);
    renderPins(".level3__pins",pinsData_level3);
    renderPins(".level4__pins",pinsData_level4);

    // pins 配列を再取得
    pins = Array.from(mallLevelsEl.querySelectorAll('.pin'));

    // イベント初期化（pins が存在する状態で）
    init();
  } catch (err) {
    console.error("ピン読み込みエラー:", err);
  }
}

  // ピンをDOMに追加
  function renderPins(container,pinsData) {
    const pinsContainer = document.querySelector(container);

    pinsData.forEach(pin => {
        const a = document.createElement("a");
        a.className = `pin ${pin.class}`;
        a.dataset.category = pin.category;
        a.dataset.space = pin.space;
        a.href = "#";
        a.ariaLabel = `Pin for ${pin.label}`;
		a.style.top = pin.top;
        a.style.left = pin.left;
        
        const span = document.createElement("span");
        span.className = "pin__icon";

        const svgPin = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgPin.classList.add("icon", "icon--pin");
        const usePin = document.createElementNS("http://www.w3.org/2000/svg", "use");
        usePin.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#icon-pin");
        svgPin.appendChild(usePin);

        const svgLogo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgLogo.classList.add("icon", "icon--logo", `icon--${pin.icon}`);

		const useLogo = document.createElementNS("http://www.w3.org/2000/svg", "use");

		// 新しい書き方（最近のブラウザ向け）
		useLogo.setAttribute("href", `#icon-${pin.icon}`);

		// 古い書き方（互換性が必要なら残す）
		useLogo.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#icon-${pin.icon}`);

		svgLogo.appendChild(useLogo);


        span.appendChild(svgPin);
        span.appendChild(svgLogo);
        a.appendChild(span);

        pinsContainer.appendChild(a);
    });

    // ★ 動的追加後に pins を取り直す
    pins = Array.from(mallLevelsEl.querySelectorAll('.pin'));
}

window.insertContentFromJSON = async function(containerSelector, jsonPath) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('JSON取得に失敗しました');
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.items;

        container.innerHTML = '';
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'content__item';
            itemDiv.setAttribute('data-space', item.space);
            itemDiv.setAttribute('data-category', item.category);

            const title = document.createElement('h3');
            title.className = 'content__item-title';
            title.textContent = item.title;

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'content__item-details';

            const metaP = document.createElement('p');
            metaP.className = 'content__meta';
            item.meta.forEach(metaItem => {
                const span = document.createElement('span');
                span.className = 'content__meta-item';
                span.textContent = metaItem;
                metaP.appendChild(span);
            });

            const descP = document.createElement('p');
            descP.className = 'content__desc';
            descP.innerHTML = item.description;

            detailsDiv.appendChild(metaP);
            detailsDiv.appendChild(descP);
            itemDiv.appendChild(title);
            itemDiv.appendChild(detailsDiv);
            container.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
};

window.insertListFromJSON = async function(listSelector, jsonPath) {
  const listEl = document.querySelector(listSelector);
  if (!listEl) return;

  try {
    const response = await fetch(jsonPath);
    if (!response.ok) throw new Error('JSON取得に失敗しました');
    const data = await response.json();
    const items = Array.isArray(data) ? data : data.items;

    // 既存リストをクリア
    listEl.innerHTML = '';

    // JSONデータを <li> に変換
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list__item';
      li.dataset.level = item.level;
      li.dataset.category = item.category;
      li.dataset.space = item.space;

      const a = document.createElement('a');
      a.href = '#';
      a.className = 'list__link';
      a.textContent = item.name;

      li.appendChild(a);
      listEl.appendChild(li);
    });

  } catch (error) {
    console.error('Error loading list JSON:', error);
  }
};

	
	// helper functions
	// from https://davidwalsh.name/vendor-prefix
	var prefix = (function () {
		var styles = window.getComputedStyle(document.documentElement, ''),
			pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1],
			dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
		
		return {
			dom: dom,
			lowercase: pre,
			css: '-' + pre + '-',
			js: pre[0].toUpperCase() + pre.substr(1)
		};
	})();
	
	// vars & stuff
	var support = {transitions : Modernizr.csstransitions},
		transEndEventNames = {'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend'},
		transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
		onEndTransition = function(el, callback, propTest) {
			var onEndCallbackFn = function( ev ) {
				if( support.transitions ) {
					if( ev.target != this || propTest && ev.propertyName !== propTest && ev.propertyName !== prefix.css + propTest ) return;
					this.removeEventListener( transEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(this); }
			};
			if( support.transitions ) {
				el.addEventListener( transEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		},
		// the mall element
		mall = document.querySelector('.mall'),
		// mall´s levels wrapper
		mallLevelsEl = mall.querySelector('.levels'),
		// mall´s levels
		mallLevels = [].slice.call(mallLevelsEl.querySelectorAll('.level')),
		// total levels
		mallLevelsTotal = mallLevels.length,
		// surroundings elems
		mallSurroundings = [].slice.call(mall.querySelectorAll('.surroundings')),
		// selected level position
		selectedLevel,
		// navigation element wrapper
		mallNav = document.querySelector('.mallnav'),
		// show all mall´s levels ctrl
		allLevelsCtrl = mallNav.querySelector('.mallnav__button--all-levels'),
		// levels navigation up/down ctrls
		levelUpCtrl = mallNav.querySelector('.mallnav__button--up'),
		levelDownCtrl = mallNav.querySelector('.mallnav__button--down'),
		// pins
		pins = [].slice.call(mallLevelsEl.querySelectorAll('.pin')),
		// content element
		contentEl = document.querySelector('.content'),
		// content close ctrl
		contentCloseCtrl = contentEl.querySelector('button.content__button'),
		// check if a content item is opened
		isOpenContentArea,
		// check if currently animating/navigating
		isNavigating,
		// check if all levels are shown or if one level is shown (expanded)
		isExpanded,
		// spaces list element
		spacesListEl = document.getElementById('spaces-list'),
		// spaces list ul
		spacesEl = spacesListEl.querySelector('ul.list'),
		// all the spaces listed
		spaces = [].slice.call(spacesEl.querySelectorAll('.list__item > a.list__link')),
		// reference to the current shows space (name set in the data-name attr of both the listed spaces and the pins on the map)
		spaceref,
		// sort by ctrls
		sortByNameCtrl = document.querySelector('#sort-by-name'),
		// listjs initiliazation (all mall´s spaces)
		spacesList = new List('spaces-list', { valueNames: ['list__link', { data: ['level'] }, { data: ['category'] } ]} ),

		// smaller screens:
		// open search ctrl
		openSearchCtrl = document.querySelector('button.open-search'),
		// main container
		containerEl = document.querySelector('.container'),
		// close search ctrl
		closeSearchCtrl = spacesListEl.querySelector('button.close-search');

	function init() {
		// init/bind events
		initEvents();
	}
	/**
	 * Initialize/Bind events fn.
	 */
	function initEvents() {
		// click on a Mall´s level
		mallLevels.forEach(function(level, pos) {
			level.addEventListener('click', function() {
				// shows this level
				showLevel(pos+1);
			});
		});

		// click on the show mall´s levels ctrl
		allLevelsCtrl.addEventListener('click', function() {
			// shows all levels
			showAllLevels();
		});

		// navigating through the levels
		levelUpCtrl.addEventListener('click', function() { navigate('Down'); });
		levelDownCtrl.addEventListener('click', function() { navigate('Up'); });

		// sort by name ctrl - add/remove category name (css pseudo element) from list and sorts the spaces by name 
		sortByNameCtrl.addEventListener('click', function() {
			if( this.checked ) {
				classie.remove(spacesEl, 'grouped-by-category');
				spacesList.sort('list__link');
			}
			else {
				classie.add(spacesEl, 'grouped-by-category'); 
				spacesList.sort('category');
			}
		});
		// hovering a pin / clicking a pin
		pins.forEach(function(pin) {
			var contentItem = contentEl.querySelector('.content__item[data-space="' + pin.getAttribute('data-space') + '"]');
			pin.addEventListener('mouseenter', function() {
				if( !isOpenContentArea ) {
					classie.add(contentItem, 'content__item--hover');
				}
			});
			pin.addEventListener('mouseleave', function() {
				if( !isOpenContentArea ) {
					classie.remove(contentItem, 'content__item--hover');
				}
			});
			
			pin.addEventListener('click', function(ev) {
				ev.preventDefault();
				// open content for this pin
				openContent(pin.getAttribute('data-space'));
				// remove hover class (showing the title)
				classie.remove(contentItem, 'content__item--hover');
			});
		});
		
		// closing the content area
		contentCloseCtrl.addEventListener('click', function() {
			closeContentArea();
		});

		// clicking on a listed space: open level - shows space
		spaces.forEach(function(space) {
			var spaceItem = space.parentNode,
				level = spaceItem.getAttribute('data-level'),
				spacerefval = spaceItem.getAttribute('data-space');

			space.addEventListener('click', function(ev) {
				ev.preventDefault();
				// for smaller screens: close search bar
				closeSearch();
				// open level
				showLevel(level);
				// open content for this space
				openContent(spacerefval);
			});
		});

		// smaller screens: open the search bar
		openSearchCtrl.addEventListener('click', function() {
			openSearch();
		});

		// smaller screens: close the search bar
		closeSearchCtrl.addEventListener('click', function() {
			closeSearch();
		});
	}

	/**
	 * Opens a level. The current level moves to the center while the other ones move away.
	 */
	function showLevel(level) {
		if( isExpanded ) {
			return false;
		}
		
		// update selected level val
		selectedLevel = level;

		// control navigation controls state
		setNavigationState();

		classie.add(mallLevelsEl, 'levels--selected-' + selectedLevel);
		
		// the level element
		var levelEl = mallLevels[selectedLevel - 1];
		classie.add(levelEl, 'level--current');

		onEndTransition(levelEl, function() {
			classie.add(mallLevelsEl, 'levels--open');

			// show level pins
			showPins();

			isExpanded = true;
		}, 'transform');
		
		// hide surroundings element
		hideSurroundings();
		
		// show mall nav ctrls
		showMallNav();

		// filter the spaces for this level
		showLevelSpaces();
	}

	/**
	 * Shows all Mall´s levels
	 */
	function showAllLevels() {
		if( isNavigating || !isExpanded ) {
			return false;
		}
		isExpanded = false;

		// ズームを初期状態に戻す
		zoomZ = BASE_Z;
		panX = 0;
		panY = 0;
		updateTransform();

		classie.remove(mallLevels[selectedLevel - 1], 'level--current');
		classie.remove(mallLevelsEl, 'levels--selected-' + selectedLevel);
		classie.remove(mallLevelsEl, 'levels--open');

		// hide level pins
		removePins();

		// shows surrounding element
		showSurroundings();
		
		// hide mall nav ctrls
		hideMallNav();

		// show back the complete list of spaces
		spacesList.filter();

		// close content area if it is open
		if( isOpenContentArea ) {
			closeContentArea();
		}
	}

	/**
	 * Shows all spaces for current level
	 */
	function showLevelSpaces() {
		spacesList.filter(function(item) { 
			return item.values().level === selectedLevel.toString(); 
		});
	}

	/**
	 * Shows the level´s pins
	 */
	function showPins(levelEl) {
		var levelEl = levelEl || mallLevels[selectedLevel - 1];
		classie.add(levelEl.querySelector('.level__pins'), 'level__pins--active');
	}

	/**
	 * Removes the level´s pins
	 */
	function removePins(levelEl) {
		var levelEl = levelEl || mallLevels[selectedLevel - 1];
		classie.remove(levelEl.querySelector('.level__pins'), 'level__pins--active');
	}

	/**
	 * Show the navigation ctrls
	 */
	function showMallNav() {
		classie.remove(mallNav, 'mallnav--hidden');
	}

	/**
	 * Hide the navigation ctrls
	 */
	function hideMallNav() {
		classie.add(mallNav, 'mallnav--hidden');
	}

	/**
	 * Show the surroundings level
	 */
	function showSurroundings() {
		mallSurroundings.forEach(function(el) {
			classie.remove(el, 'surroundings--hidden');
		});
	}

	/**
	 * Hide the surroundings level
	 */
	function hideSurroundings() {
		mallSurroundings.forEach(function(el) {
			classie.add(el, 'surroundings--hidden');
		});
	}

	/**
	 * Navigate through the mall´s levels
	 */
	function navigate(direction) {
		if( isNavigating || !isExpanded || isOpenContentArea ) {
			return false;
		}
		isNavigating = true;

		var prevSelectedLevel = selectedLevel;

		// current level
		var currentLevel = mallLevels[prevSelectedLevel-1];

		if( direction === 'Up' && prevSelectedLevel > 1 ) {
			--selectedLevel;
		}
		else if( direction === 'Down' && prevSelectedLevel < mallLevelsTotal ) {
			++selectedLevel;
		}
		else {
			isNavigating = false;	
			return false;
		}

		// control navigation controls state (enabled/disabled)
		setNavigationState();
		// transition direction class
		classie.add(currentLevel, 'level--moveOut' + direction);
		// next level element
		var nextLevel = mallLevels[selectedLevel-1]
		// ..becomes the current one
		classie.add(nextLevel, 'level--current');

		// when the transition ends..
		onEndTransition(currentLevel, function() {
			classie.remove(currentLevel, 'level--moveOut' + direction);
			// solves rendering bug for the SVG opacity-fill property
			setTimeout(function() {classie.remove(currentLevel, 'level--current');}, 60);

			classie.remove(mallLevelsEl, 'levels--selected-' + prevSelectedLevel);
			classie.add(mallLevelsEl, 'levels--selected-' + selectedLevel);

			// show the current level´s pins
			showPins();

			isNavigating = false;
		});

		// filter the spaces for this level
		showLevelSpaces();

		// hide the previous level´s pins
		removePins(currentLevel);
	}

	/**
	 * Control navigation ctrls state. Add disable class to the respective ctrl when the current level is either the first or the last.
	 */
	function setNavigationState() {
		if( selectedLevel == 1 ) {
			classie.add(levelDownCtrl, 'boxbutton--disabled');
		}
		else {
			classie.remove(levelDownCtrl, 'boxbutton--disabled');
		}

		if( selectedLevel == mallLevelsTotal ) {
			classie.add(levelUpCtrl, 'boxbutton--disabled');
		}
		else {
			classie.remove(levelUpCtrl, 'boxbutton--disabled');
		}
	}

	/**
	 * Opens/Reveals a content item.
	 */
	function openContent(spacerefval) {
		// if one already shown:
		if( isOpenContentArea ) {
			hideSpace();
			spaceref = spacerefval;
			showSpace();
		}
		else {
			spaceref = spacerefval;
			openContentArea();
		}
		
		// remove class active (if any) from current list item
		var activeItem = spacesEl.querySelector('li.list__item--active');
		if( activeItem ) {
			classie.remove(activeItem, 'list__item--active');
		}
		// list item gets class active (if the list item is currently shown in the list)
		var listItem = spacesEl.querySelector('li[data-space="' + spacerefval + '"]')
		if( listItem ) {
			classie.add(listItem, 'list__item--active');
		}

		// remove class selected (if any) from current space
		var activeSpaceArea = mallLevels[selectedLevel - 1].querySelector('svg > .map__space--selected');
		if( activeSpaceArea ) {
			classie.remove(activeSpaceArea, 'map__space--selected');
		}
		// svg area gets selected
		classie.add(mallLevels[selectedLevel - 1].querySelector('svg > .map__space[data-space="' + spaceref + '"]'), 'map__space--selected');
	}

	/**
	 * Opens the content area.
	 */
	function openContentArea() {
		isOpenContentArea = true;
		// shows space
		showSpace(true);
		// show close ctrl
		classie.remove(contentCloseCtrl, 'content__button--hidden');
		// resize mall area
		classie.add(mall, 'mall--content-open');
		// disable mall nav ctrls
		classie.add(levelDownCtrl, 'boxbutton--disabled');
		classie.add(levelUpCtrl, 'boxbutton--disabled');
	}

	/**
	 * Shows a space.
	 */
	function showSpace(sliding) {
		// the content item
		var contentItem = contentEl.querySelector('.content__item[data-space="' + spaceref + '"]');
		// show content
		classie.add(contentItem, 'content__item--current');
		if( sliding ) {
			onEndTransition(contentItem, function() {
				classie.add(contentEl, 'content--open');
			});
		}
		// map pin gets selected
		classie.add(mallLevelsEl.querySelector('.pin[data-space="' + spaceref + '"]'), 'pin--active');
	}

	/**
	 * Closes the content area.
	 */
	function closeContentArea() {
		classie.remove(contentEl, 'content--open');
		// close current space
		hideSpace();
		// hide close ctrl
		classie.add(contentCloseCtrl, 'content__button--hidden');
		// resize mall area
		classie.remove(mall, 'mall--content-open');
		// enable mall nav ctrls
		if( isExpanded ) {
			setNavigationState();
		}
		isOpenContentArea = false;
	}

	/**
	 * Hides a space.
	 */
	function hideSpace() {
		// the content item
		var contentItem = contentEl.querySelector('.content__item[data-space="' + spaceref + '"]');
		// hide content
		classie.remove(contentItem, 'content__item--current');
		// map pin gets unselected
		classie.remove(mallLevelsEl.querySelector('.pin[data-space="' + spaceref + '"]'), 'pin--active');
		// remove class active (if any) from current list item
		var activeItem = spacesEl.querySelector('li.list__item--active');
		if( activeItem ) {
			classie.remove(activeItem, 'list__item--active');
		}
		// remove class selected (if any) from current space
		var activeSpaceArea = mallLevels[selectedLevel - 1].querySelector('svg > .map__space--selected');
		if( activeSpaceArea ) {
			classie.remove(activeSpaceArea, 'map__space--selected');
		}
	}

	/**
	 * for smaller screens: open search bar
	 */
	function openSearch() {
		// shows all levels - we want to show all the spaces for smaller screens 
		showAllLevels();

		classie.add(spacesListEl, 'spaces-list--open');
		classie.add(containerEl, 'container--overflow');
	}

	/**
	 * for smaller screens: close search bar
	 */
	function closeSearch() {
		classie.remove(spacesListEl, 'spaces-list--open');
		classie.remove(containerEl, 'container--overflow');
	}

	/* マップズーム */
	const levelsWrapEl = document.querySelector('.levels-wrap');
	const pinchArea = document.querySelector('.pinch-area');

	const BASE_Z = 0; // 初期位置
	let zoomZ = BASE_Z;
	const MIN_Z = 0;
	const MAX_Z = 2100;
	const STEP = 300;
	// ピンチアップ対応用
	let isPinching = false;
	let startDistance = 0;
	let startZoomZ = zoomZ;

	// ズーム強度
	const PINCH_SENSITIVITY = 9;

	function updateTransform() {
		levelsWrapEl.style.transform =
			`translateX(${panX}px)
			translateY(${panY}px)
			translateZ(${zoomZ}px)
			rotateX(70deg)
			rotateZ(-45deg)
			translateZ(-15vmin)`;
	}

	document.getElementById('zoom-in').addEventListener('click', () => {
		zoomZ = Math.min(MAX_Z, zoomZ + STEP);
		updateTransform();
	});

	document.getElementById('zoom-out').addEventListener('click', () => {
		zoomZ = Math.max(MIN_Z, zoomZ - STEP);
		updateTransform();
	});

	function getTouchDistance(e) {
		const dx = e.touches[0].clientX - e.touches[1].clientX;
		const dy = e.touches[0].clientY - e.touches[1].clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/* パン */
	let panX = 0;
	let panY = 0;

	let isPanning = false;
	let startX = 0;
	let startY = 0;

	let moved = false;
	const MOVE_THRESHOLD = 5; // px（これ以下はタップ）

	function getPoint(e) {
		if (e.touches && e.touches.length) {
			return {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			};
		}
		return {
			x: e.clientX,
			y: e.clientY
		};
	}

	levelsWrapEl.addEventListener('mousedown', startPan);
	pinchArea.addEventListener('touchstart', (e) => {
		if (e.touches.length === 2) {
			isPinching = true;
			isPanning = false;

			startDistance = getTouchDistance(e);
			startZoomZ = zoomZ;

			e.preventDefault();
			return;
		}
		
		isPinching = false;
		startPan(e);
	}, { passive: false });

	document.addEventListener('mousemove', movePan);
	pinchArea.addEventListener('touchmove', (e) => {
		if (isPinching && e.touches.length === 2) {
			e.preventDefault();
		zoomZ += 30;   // ← 指を動かすだけでズーム

			const currentDistance = getTouchDistance(e);
			const delta = currentDistance - startDistance;

			zoomZ = startZoomZ + delta * PINCH_SENSITIVITY;
			zoomZ = Math.max(MIN_Z, Math.min(MAX_Z, zoomZ));

			updateTransform();
			return;
		}
		
		movePan(e);
	}, { passive: false });

	document.addEventListener('mouseup', endPan);
	pinchArea.addEventListener('touchend', onTouchEnd);
	document.addEventListener('touchcancel', onTouchEnd);

	function onTouchEnd(e) {
		isPinching = false;
		endPan(e);
	}

	function startPan(e) {
		moved = false;
		isPanning = true;

		const p = getPoint(e);
		startX = p.x;
		startY = p.y;

		levelsWrapEl.style.cursor = 'grabbing';
	}

	function movePan(e) {
		if (isPinching && e.touches && e.touches.length < 2) {
			isPinching = false;
		}
		if (!isPanning || isPinching) return;

		const p = getPoint(e);
		const dx = p.x - startX;
		const dy = p.y - startY;

		if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
			e.preventDefault();
			moved = true;

			panX += dx;
			panY += dy;

			startX = p.x;
			startY = p.y;

			updateTransform();
		}
	}

	function endPan(e) {
		isPanning = false;
		levelsWrapEl.style.cursor = 'grab';

		if (!moved) {
			const target = e.target.closest('a, .pin');
			if (target) {
				target.click();
			}
		}
	}
	
})(window);


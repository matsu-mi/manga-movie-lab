document.addEventListener('DOMContentLoaded', () => {

	// --- merit-wrapperのアンダーラインアニメーション発火 ---
	const meritObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.querySelectorAll('span').forEach(span => {
					span.classList.add('is-visible');
				});
				observer.unobserve(entry.target);
			}
		});
	}, {
		threshold: 0.3,
		rootMargin: '0px 0px -20% 0px'
	});

	document.querySelectorAll('.merit-wrapper').forEach(wrapper => {
		meritObserver.observe(wrapper);
	});

	// --- 1. キャンペーンバッジ等の監視設定（IntersectionObserver） ---
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const badge = entry.target.querySelector('.campaign-badge');
				if (badge) {
					badge.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			}
		});
	}, { 
		threshold: 0.1 
	});

	const cardUnits = document.querySelectorAll('.card-unit');
	if (cardUnits.length > 0) {
		cardUnits.forEach(unit => {
			observer.observe(unit);
		});
	} else {
		document.querySelectorAll('.card').forEach(card => {
			observer.observe(card);
		});
	}

	// --- 2. スムーススクロール関連 ---
	function easeInOutQuad(t) {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}

	function slowScrollTo(element, duration = 1000) {
		const start = window.pageYOffset;
		const end = element.getBoundingClientRect().top + window.pageYOffset;
		const distance = end - start;
		let startTime = null;

		function animation(currentTime) {
			if (!startTime) startTime = currentTime;
			const timeElapsed = currentTime - startTime;
			const progress = Math.min(timeElapsed / duration, 1);
			window.scrollTo(0, start + distance * easeInOutQuad(progress));
			if (progress < 1) {
				requestAnimationFrame(animation);
			}
		}
		requestAnimationFrame(animation);
	}

	// ページ内リンクのスムーススクロール
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function(e) {
			const targetId = this.getAttribute('href').slice(1);
			if (targetId === "") {
				e.preventDefault();
				window.scrollTo({ top: 0, behavior: 'smooth' });
				return;
			}
			const target = document.getElementById(targetId);
			if (target) {
				e.preventDefault();
				slowScrollTo(target, 800);
			}
		});
	});

	// --- 3. ビデオ操作の制御（画像切り替え・複数対応版） ---
	const allVideoWrappers = document.querySelectorAll('.video-container');

	allVideoWrappers.forEach(container => {
		const video = container.querySelector('video');
		const overlay = container.querySelector('.play-overlay');
		const muteBtn = container.querySelector('.mute-button');
		const btnText = container.querySelector('.btn-text, #btnText');

		if (!video || !overlay) return;

		// 再生・一時停止の切り替え関数
		const togglePlay = () => {
			if (video.paused) {
				video.play();
				overlay.classList.add('playing');
			} else {
				video.pause();
				overlay.classList.remove('playing');
			}
		};

		// オーバーレイクリックイベント
		overlay.addEventListener('click', togglePlay);

		// ミュートボタンの制御
		if (muteBtn) {
			muteBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				video.muted = !video.muted;
				
				// CSSでアイコンを変えるための状態クラス付与
				container.classList.toggle('is-muted', video.muted);
				container.classList.toggle('is-unmuted', !video.muted);
				
				if (btnText) {
					btnText.textContent = video.muted ? '音を出す' : '音を消す';
				}
			});
		}

		// 動画終了時にアイコンを戻す
		video.addEventListener('ended', () => {
			overlay.classList.remove('playing');
		});
	});

}); // ここで正しくDOMContentLoadedを閉じています
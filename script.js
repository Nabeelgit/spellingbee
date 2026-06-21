async function getRandomWord(){
    let wordArr = [];

    const wordRes = await fetch("https://random-word-api.herokuapp.com/word");
    const [word] = await wordRes.json();

    wordArr.push(word);

    const defRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    let defData = "No definition available";
    if(defRes.ok){
        defData = await defRes.json();
        defData = defData[0]?.meanings?.[0]?.definitions?.[0]?.definition ?? "No definition available";
    }

    wordArr.push(defData);

    return wordArr;
}

const intro_screen = document.getElementById("intro-screen");
const game_screen = document.getElementById("game-screen");
const start_btn = document.getElementById("start-btn");

const spell_input = document.getElementById("spell-input");
const enter_btn = document.getElementById("enter-btn");
const speak_again_btn = document.getElementById("speak-again-btn");
const definition_p = document.getElementById("word-definition");
const fallback_next_btn = document.getElementById("fallback-next-btn");

const modal_overlay = document.getElementById("modal-overlay");
const modal = document.getElementById("modal");
const modal_body = document.getElementById("modal-body");
const modal_close_btn = document.getElementById("modal-close-btn");
const next_word_btn = document.getElementById("next-word-btn");
const confetti_canvas = document.getElementById("confetti-canvas");

let current_word = "";
let current_definition = "";

function handleWord(words){
    current_word = words[0];
    console.log(current_word);
    current_definition = words[1];

    const prefixes = ["Please spell", "Spell", "Try spelling"];
    const random_prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    speakText(`${random_prefix} ${current_word}`);

    definition_p.innerText = current_definition;
}

start_btn.addEventListener("click", function(){
    intro_screen.classList.add("hidden");
    game_screen.classList.remove("hidden");
    getRandomWord().then(handleWord);
})

enter_btn.addEventListener("click", function(){
    let user_inp = spell_input.value.trim();
    if(user_inp !== ""){
        const is_correct = current_word.toLowerCase() === user_inp.toLowerCase();
        openModal(is_correct, user_inp);

        spell_input.value = "";
        definition_p.innerText = "";
    }
})

speak_again_btn.addEventListener("click", function(){
    speakText(current_word);
})

function openModal(is_correct, user_guess){
    modal.classList.remove("correct", "incorrect");
    modal.classList.add(is_correct ? "correct" : "incorrect");

    if(is_correct){
        modal_body.innerHTML = `
            <p>${current_word}</p>
            <p class="definition">${current_definition}</p>
        `;
        launchConfetti();
    } else {
        modal_body.innerHTML = `
            <p><strong>Incorrect!</strong></p>
            <p><strong>Your spelling:</strong> ${user_guess}</p>
            <p><strong>Correct spelling:</strong> ${current_word}</p>
        `;
    }

    modal_overlay.classList.remove("hidden");
}

function closeModal(was_dismissed){
    modal_overlay.classList.add("hidden");
    if(was_dismissed){
        fallback_next_btn.classList.remove("hidden");
    } else {
        fallback_next_btn.classList.add("hidden");
    }
}

modal_close_btn.addEventListener("click", function(){
    closeModal(true);
});

modal_overlay.addEventListener("click", function(e){
    if(e.target === modal_overlay){
        closeModal(true);
    }
});

next_word_btn.addEventListener("click", function(){
    closeModal(false);
    getRandomWord().then(handleWord);
});

fallback_next_btn.addEventListener("click", function(){
    fallback_next_btn.classList.add("hidden");
    getRandomWord().then(handleWord);
});

function launchConfetti(){
    const ctx = confetti_canvas.getContext("2d");
    confetti_canvas.width = window.innerWidth;
    confetti_canvas.height = window.innerHeight;

    const colors = ["#2e8b3d", "#f1c40f", "#3498db", "#e74c3c", "#9b59b6"];
    const particle_count = 120;
    const particles = [];

    for(let i = 0; i < particle_count; i++){
        particles.push({
            x: Math.random() * confetti_canvas.width,
            y: -20 - Math.random() * confetti_canvas.height * 0.5,
            size: 6 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 2 + Math.random() * 3,
            drift: -1 + Math.random() * 2,
            rotation: Math.random() * 360,
            rotation_speed: -4 + Math.random() * 8
        });
    }

    const duration = 2500;
    const start_time = performance.now();

    function animate(now){
        const elapsed = now - start_time;
        ctx.clearRect(0, 0, confetti_canvas.width, confetti_canvas.height);

        particles.forEach(function(p){
            p.y += p.speed;
            p.x += p.drift;
            p.rotation += p.rotation_speed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });

        if(elapsed < duration){
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, confetti_canvas.width, confetti_canvas.height);
        }
    }

    requestAnimationFrame(animate);
}

window.addEventListener("resize", function(){
    confetti_canvas.width = window.innerWidth;
    confetti_canvas.height = window.innerHeight;
});

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.5;
        utterance.pitch = 2;
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech not supported in this browser.');
    }
}

document.addEventListener("keydown", function(e){
    if(e.key !== "Enter") return;

    if(!intro_screen.classList.contains("hidden")){
        e.preventDefault();
        start_btn.click();
        return;
    }

    if(!modal_overlay.classList.contains("hidden")){
        e.preventDefault();
        next_word_btn.click();
        return;
    }

    if(!fallback_next_btn.classList.contains("hidden")){
        e.preventDefault();
        fallback_next_btn.click();
        return;
    }

    if(document.activeElement === spell_input){
        e.preventDefault();
        enter_btn.click();
    }
});

document.addEventListener("keydown", function(e){
    if(e.key !== "/") return;
    if(document.activeElement === spell_input) return;
    if(game_screen.classList.contains("hidden")) return;

    e.preventDefault();
    spell_input.focus();
});

document.addEventListener("keydown", function(e){
    if(e.code !== "Space") return;
    if(document.activeElement === spell_input) return;
    if(document.activeElement && document.activeElement.tagName === "BUTTON") return;
    if(game_screen.classList.contains("hidden")) return;
    if(!modal_overlay.classList.contains("hidden")) return;

    e.preventDefault();
    speak_again_btn.click();
});
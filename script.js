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

let current_word = "";
let current_definition = "";

function handleWord(words){
    current_word = words[0];
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
        if(current_word.toLowerCase() === user_inp.toLowerCase()){
            alert("Correct!");
        } else {
            alert(`Sorry thats wrong! the correct spelling is ${current_word}`)
        }
        spell_input.value = "";
        definition_p.innerText = "";

        getRandomWord().then(handleWord);
    }
})

speak_again_btn.addEventListener("click", function(){
    speakText(current_word);
})

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.3;
        utterance.pitch = 2;
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech not supported in this browser.');
    }
}
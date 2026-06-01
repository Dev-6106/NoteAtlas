import * as googleTTS from 'google-tts-api';

async function testTTS() {
    try {
        const url = googleTTS.getAudioUrl('Hello world, this is a test of the Google TTS API.', {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });
        console.log("Audio URL:", url);

        const base64Audio = await googleTTS.getAudioBase64('Hello world, this is a test of the Google TTS API.', {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });
        console.log("Base64 Audio Length:", base64Audio.length);
    } catch (e) {
        console.error("TTS Error:", e);
    }
}

testTTS();

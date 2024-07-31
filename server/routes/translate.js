const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

const translateClient = new TranslateClient({ region: 'us-east-1' }); // Replace with your region

const translateText = async (text, targetLanguage) => {
    if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be null or empty.');
    }

    try {
        const command = new TranslateTextCommand({
            Text: text,
            SourceLanguageCode: 'en', // or detect the source language
            TargetLanguageCode: targetLanguage,
        });

        const response = await translateClient.send(command);
        return response.TranslatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        throw error;
    }
};

// Test translation
translateText('Hello, world!', 'es') // Translate to Spanish
    .then(translatedText => console.log('Translated text:', translatedText))
    .catch(error => console.error('Error:', error));

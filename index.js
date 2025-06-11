import { Router, createCors, error, json } from 'itty-router';

// import the routes
import { chatHandler, chatHandlerOllama } from './routes/chat';
import { completionHandler } from './routes/completion';
import { embeddingsHandler } from './routes/embeddings';
import { transcriptionHandler, translationHandler } from './routes/audio';
import { getImageHandler, imageGenerationHandler } from './routes/image';
import { modelsHandler, modelsHandlerOllama, validOllama } from './routes/models';

const { preflight, corsify } = createCors();

// Create a new router
const router = Router({ base: '/' });
const api_base = "/llm"
const openai_api_base = `${api_base}/openai/v1`;
const ollama_api_base = `${api_base}/ollama`;


function extractToken(authorizationHeader) {
	if (authorizationHeader) {
		const parts = authorizationHeader.split(' ');
		if (parts.length === 2 && parts[0] === 'Bearer') {
			return parts[1];
		}
	}
	return null;
}
// MIDDLEWARE: withAuthenticatedUser - embeds user in Request or returns a 401
const bearerAuthentication = (request, env) => {
	const authorizationHeader = request.headers.get('Authorization');
	if (!authorizationHeader) {
		return error(401, 'Unauthorized');
	}
	const access_token = extractToken(authorizationHeader);
	if (env.ACCESS_TOKEN !== access_token) {
		return error(403, 'Forbidden');
	}
};



const passwordAuthentication = (request, env) => {
	const authorizationHeader = request.headers.get('Authorization');

	if (!authorizationHeader || !authorizationHeader.startsWith('Basic ')) {
		// If no Authorization header or not basic auth, return 401 Unauthorized
		return new Response('Unauthorized', {
			status: 401,
			headers: { 'WWW-Authenticate': 'Basic realm="Protected Area"' },
		});
	}

	const encodedCredentials = authorizationHeader.substring('Basic '.length).trim();
	const decodedCredentials = atob(encodedCredentials);
	const [username, password] = decodedCredentials.split(':');



	console.log(`passwordAuthentication username: ${username}, password: ${password},authorizationHeader : ${authorizationHeader}`)

	const access_token = password;
	if (env.ACCESS_TOKEN !== access_token) {
		return error(403, 'Forbidden');
	}
};

// CORS, see https://itty.dev/itty-router/cors
router.all('*', preflight);

router
	.all(`${ollama_api_base}/*`, passwordAuthentication)
	.get(`${ollama_api_base}/`, validOllama)

	.get(`${ollama_api_base}/api/tags`, modelsHandlerOllama)
	.post(`${ollama_api_base}/api/chat`, chatHandler);

router.all(`${openai_api_base}/*`, bearerAuthentication)
	.post(`${openai_api_base}/chat/completions`, chatHandler)
	.post(`${openai_api_base}/completions`, completionHandler)
	.post(`${openai_api_base}/embeddings`, embeddingsHandler)
	.post(`${openai_api_base}/audio/transcriptions`, transcriptionHandler)
	.post(`${openai_api_base}/audio/translations`, translationHandler)
	.post(`${openai_api_base}/images/generations`, imageGenerationHandler)
	.get(`${openai_api_base}/images/get/:name`, getImageHandler)
	.get(`${openai_api_base}/models`, modelsHandler);

// 404 for everything else
router.all('*', () => new Response('404, not found!', { status: 404 }));

export default {
	fetch: (request, env, ctx) =>
		router
			.handle(request, env, ctx)

			// catch any errors
			.catch(e => {
				console.error(e);
				return error(e);
			})

			// add CORS headers to all requests,
			// including errors
			.then(corsify),
};

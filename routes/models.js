import { json } from 'itty-router';

const getModels = async env => {
	const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/models/search?hide_experimental=false`;
	const headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
	};

	const response = await fetch(url, { headers });

	if (!response.ok) {
		throw new Error(`Failed to fetch models: ${response.statusText}`);
	}

	const data = await response.json();

	return data.result;
};

export const modelsHandler = async (request, env) => {
	const models = await getModels(env);

	const modelList = models.map(model => ({
		id: model.name,
		object: 'model',
		created: Math.round(Date.now()),
		owned_by: model.source === 1 ? 'cloudflare' : 'huggingface',
	}));

	return json({
		object: 'list',
		data: modelList,
	});
};

export const validOllama = (request, env) => {
	console.log('validOllama');
return new Response('Ollama is running', {
			status: 200,
			headers: {
				'access-control-allow-credentials': 'true',

				'access-control-allow-headers': 'Origin, Content-Type, Accept, Authorization, x-requested-with',
				'access-control-allow-methods': 'GET, POST, OPTIONS'

			},
		});
}
//https://github.com/ollama/ollama/blob/main/docs/api.md#list-local-models
export const modelsHandlerOllama = async (request, env) => {
	const models = await getModels(env);
	const now = new Date();
	const isoDate = now.toISOString();
	const modelList = models.map(model => ({
		name: `${model.name}`,
		model: model.name,
		modified_at: isoDate,
		size: 2019393189,
		digest: "a80c4f17acd55265feec403c7aef86be0c25983ab279d83f3bcd3abbcb5b8b72",
		details: {
			parent_model: "",
			format: "gguf",
			family: "llama",
			families: [
				"llama"
			],
			parameter_size: "3.2B",
			quantization_level: "Q4_K_M"
		}
	}));

	return json({
		models: modelList,
	});
};



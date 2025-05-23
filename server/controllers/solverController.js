const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const WOLFRAM_ALPHA_APP_ID = process.env.WOLFRAM_ALPHA_APP_ID;

exports.queryWolframAlpha = async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: 'Query is required' });
    }

    if (!WOLFRAM_ALPHA_APP_ID) {
        console.error('WOLFRAM_ALPHA_APP_ID is not set in .env');
        return res.status(500).json({ message: 'Solver configuration error.' });
    }

    const apiUrl = `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=plaintext,mathml&output=JSON&appid=${WOLFRAM_ALPHA_APP_ID}`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.queryresult && data.queryresult.success) {
            const pods = data.queryresult.pods || [];
            let solution = {
                input: query,
                solution: null,
                steps: [],
                plots: [],
                relatedConcepts: []
            };

            // Extract main result
            const resultPod = pods.find(pod => pod.id === 'Result' || pod.primary);
            if (resultPod && resultPod.subpods && resultPod.subpods[0]) {
                solution.solution = resultPod.subpods[0].plaintext || resultPod.subpods[0].img?.src;
            }

            // Extract step-by-step solution
            const stepByStepPod = pods.find(pod => 
                pod.id === 'StepByStepSolution' || 
                pod.title.toLowerCase().includes('step-by-step')
            );
            
            if (stepByStepPod && stepByStepPod.subpods) {
                solution.steps = stepByStepPod.subpods.map(subpod => ({
                    title: subpod.title || 'Step',
                    explanation: subpod.plaintext || '',
                    image: subpod.img?.src
                }));
            } else if (resultPod && resultPod.subpods && resultPod.subpods.length > 1) {
                // Fallback: use multiple subpods from result as steps
                solution.steps = resultPod.subpods.map(subpod => ({
                    title: subpod.title || 'Part',
                    explanation: subpod.plaintext || '',
                    image: subpod.img?.src
                }));
            } else if (solution.result && solution.steps.length === 0) {
                // Last resort: use main result as a single step
                solution.steps.push({
                    title: 'Solution',
                    explanation: solution.result
                });
            }

            // Extract plots
            const plotPods = pods.filter(pod => 
                pod.id === 'Plot' || 
                pod.id === 'ImplicitPlot' || 
                pod.title.toLowerCase().includes('plot')
            );
            
            plotPods.forEach(plotPod => {
                if (plotPod.subpods) {
                    plotPod.subpods.forEach(subpod => {
                        if (subpod.img && subpod.img.src) {
                            solution.plots.push({
                                title: subpod.title || plotPod.title,
                                src: subpod.img.src,
                                alt: subpod.img.alt
                            });
                        }
                    });
                }
            });

            // Ensure we have at least a result or steps
            if (!solution.result && solution.steps.length > 0) {
                solution.result = solution.steps[solution.steps.length - 1].explanation;
            }

            if (!solution.result && !solution.steps.length) {
                return res.status(404).json({ 
                    message: "Could not find a result or steps for this query." 
                });
            }

            res.json(solution);

        } else if (data.queryresult && data.queryresult.error) {
            console.error("Wolfram Alpha API Error:", data.queryresult.error.msg);
            res.status(400).json({ 
                message: `Solver Error: ${data.queryresult.error.msg}` 
            });
        } else {
            console.warn("Wolfram Alpha - No success or error:", data.queryresult?.didyoumeans);
            let message = "Could not compute the query.";
            if (data.queryresult?.didyoumeans) {
                message += ` Did you mean: ${
                    Array.isArray(data.queryresult.didyoumeans) 
                        ? data.queryresult.didyoumeans.map(m => m.val).join(', ') 
                        : data.queryresult.didyoumeans.val
                }?`;
            }
            res.status(404).json({ message });
        }

    } catch (error) {
        console.error('Error querying Wolfram Alpha API:', error.message);
        if (error.response) {
            console.error('Wolfram Error Response:', error.response.data);
        }
        res.status(500).json({ 
            message: 'Internal server error while contacting solver.' 
        });
    }
}; 
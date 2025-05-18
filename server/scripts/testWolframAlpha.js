require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WOLFRAM_ALPHA_APP_ID = process.env.WOLFRAM_ALPHA_APP_ID;

if (!WOLFRAM_ALPHA_APP_ID) {
    console.error('Error: WOLFRAM_ALPHA_APP_ID is not set in .env');
    process.exit(1);
}

const testQueries = [
    // Basic Arithmetic
    '2 + 2',
    '\\sqrt{16}',
    
    // Calculus
    '\\lim_{x \\to 0} \\frac{\\sin(x)}{x}',
    '\\int_{0}^{\\pi} \\sin(x) dx',
    
    // Algebra
    'factor x^2 - 4',
    'solve 2x + 5 = 13',
    
    // Statistics
    'mean of [1, 2, 3, 4, 5]',
    'standard deviation of [2, 4, 6, 8, 10]',
    
    // Geometry
    'area of circle radius 5',
    'volume of sphere radius 3',
    
    // Complex Numbers
    '(2 + 3i) * (4 - 5i)',
    
    // Trigonometry
    '\\sin^2(x) + \\cos^2(x)',
    '\\tan(45^\\circ)',
    
    // Unit Conversions
    'convert 5 meters to feet',
    'convert 100 km/h to mph'
];

// Create results directory if it doesn't exist
const resultsDir = path.join(__dirname, 'wolfram_results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
}

async function testQuery(query) {
    console.log('\nTesting query:', query);
    console.log('-'.repeat(50));
    
    try {
        const apiUrl = `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=plaintext,mathml&output=JSON&appid=${WOLFRAM_ALPHA_APP_ID}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Save raw response to file
        const safeQuery = query.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        fs.writeFileSync(
            path.join(resultsDir, `${safeQuery}_raw.json`),
            JSON.stringify(data, null, 2)
        );

        if (data.queryresult && data.queryresult.success) {
            console.log('Success! Found pods:');
            
            // Track pod statistics
            const podStats = {
                totalPods: data.queryresult.pods.length,
                podTypes: new Set(),
                hasStepByStep: false,
                hasPlots: false,
                hasMathML: false
            };

            data.queryresult.pods.forEach(pod => {
                podStats.podTypes.add(pod.id);
                if (pod.id === 'StepByStepSolution' || pod.title.toLowerCase().includes('step-by-step')) {
                    podStats.hasStepByStep = true;
                }
                if (pod.id === 'Plot' || pod.title.toLowerCase().includes('plot')) {
                    podStats.hasPlots = true;
                }

                console.log(`\nPod: ${pod.title} (${pod.id})`);
                if (pod.subpods) {
                    pod.subpods.forEach((subpod, index) => {
                        console.log(`  Subpod ${index + 1}:`);
                        if (subpod.plaintext) {
                            console.log(`    Text: ${subpod.plaintext}`);
                        }
                        if (subpod.mathml) {
                            console.log(`    MathML: ${subpod.mathml.substring(0, 100)}...`);
                            podStats.hasMathML = true;
                        }
                        if (subpod.img) {
                            console.log(`    Image: ${subpod.img.src}`);
                            console.log(`    Image Alt: ${subpod.img.alt}`);
                        }
                    });
                }
            });

            // Log pod statistics
            console.log('\nPod Statistics:');
            console.log(`Total Pods: ${podStats.totalPods}`);
            console.log('Pod Types:', Array.from(podStats.podTypes).join(', '));
            console.log('Has Step-by-Step:', podStats.hasStepByStep);
            console.log('Has Plots:', podStats.hasPlots);
            console.log('Has MathML:', podStats.hasMathML);

            // Save processed response
            const processedResponse = {
                query,
                success: true,
                podStats,
                pods: data.queryresult.pods.map(pod => ({
                    id: pod.id,
                    title: pod.title,
                    primary: pod.primary,
                    subpods: pod.subpods.map(subpod => ({
                        hasText: !!subpod.plaintext,
                        hasMathML: !!subpod.mathml,
                        hasImage: !!subpod.img,
                        textPreview: subpod.plaintext ? subpod.plaintext.substring(0, 100) : null
                    }))
                }))
            };

            fs.writeFileSync(
                path.join(resultsDir, `${safeQuery}_processed.json`),
                JSON.stringify(processedResponse, null, 2)
            );

        } else if (data.queryresult && data.queryresult.error) {
            console.error('Error:', data.queryresult.error.msg);
            fs.writeFileSync(
                path.join(resultsDir, `${safeQuery}_error.json`),
                JSON.stringify(data.queryresult.error, null, 2)
            );
        } else {
            console.warn('No success or error in response');
            if (data.queryresult?.didyoumeans) {
                console.log('Did you mean:', data.queryresult.didyoumeans);
            }
            fs.writeFileSync(
                path.join(resultsDir, `${safeQuery}_no_result.json`),
                JSON.stringify(data.queryresult, null, 2)
            );
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            fs.writeFileSync(
                path.join(resultsDir, `${safeQuery}_error.json`),
                JSON.stringify(error.response.data, null, 2)
            );
        }
    }
}

async function runTests() {
    console.log('Starting Wolfram Alpha API tests...');
    console.log('API Key Status:', WOLFRAM_ALPHA_APP_ID ? 'Set' : 'Not Set');
    console.log('Results will be saved in:', resultsDir);
    console.log('='.repeat(50));

    for (const query of testQueries) {
        await testQuery(query);
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\nTests completed! Check the results directory for detailed JSON files.');
}

runTests().catch(console.error); 
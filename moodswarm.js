// Mood Swarm Core Implementation
class MoodSwarm {
    constructor() {
        this.swarm = [];
        this.generation = 0;
        this.bestFitness = 0;
        this.fitnessHistory = [];
        this.emotionHistory = { valence: [], arousal: [], stance: [] };
        this.isEvolving = false;
        this.evolutionInterval = null;
        
        // Initialize Charts
        this.initCharts();
        
        // Set up event listeners
        document.getElementById('init-swarm').addEventListener('click', () => this.initSwarm());
        document.getElementById('start-evolution').addEventListener('click', () => this.toggleEvolution());
        document.getElementById('next-generation').addEventListener('click', () => this.runGeneration());
        document.getElementById('reset').addEventListener('click', () => this.resetSwarm());
        document.getElementById('generate-response').addEventListener('click', () => this.generateResponse());
    }
    
    // Initialize the swarm with 128 agents
    initSwarm() {
        this.swarm = [];
        const container = document.getElementById('swarm-container');
        container.innerHTML = '';
        
        for (let i = 0; i < 128; i++) {
            const agent = {
                id: i + 1,
                valence: this.randomRange(-1, 1),
                arousal: this.randomRange(0, 1),
                stance: Math.floor(this.randomRange(0, 3)),
                fitness: 0,
                response: ""
            };
            
            this.swarm.push(agent);
            
            // Create agent visualization
            const agentEl = document.createElement('div');
            agentEl.className = 'agent';
            agentEl.innerHTML = `
                <div class="agent-id">Agent ${agent.id}</div>
                <div>Valence</div>
                <div class="emotion-bar">
                    <div class="emotion-fill valence-fill" style="width: ${((agent.valence + 1) / 2) * 100}%"></div>
                </div>
                <div>Arousal</div>
                <div class="emotion-bar">
                    <div class="emotion-fill arousal-fill" style="width: ${agent.arousal * 100}%"></div>
                </div>
                <div>Stance</div>
                <div class="emotion-bar">
                    <div class="emotion-fill stance-fill" style="width: ${(agent.stance / 2) * 100}%"></div>
                </div>
                <div class="agent-stats">
                    <div>Fitness:</div>
                    <div>${agent.fitness.toFixed(2)}</div>
                </div>
            `;
            
            container.appendChild(agentEl);
        }
        
        this.generation = 0;
        this.updateGenerationInfo();
    }
    
    // Run one generation of evolution
    runGeneration() {
        if (this.swarm.length === 0) {
            alert("Please initialize the swarm first!");
            return;
        }
        
        // 1. Generate responses for each agent
        const prompt = document.getElementById('prompt-input').value;
        this.generateResponses(prompt);
        
        // 2. Calculate fitness for each agent
        this.calculateFitness();
        
        // 3. Select top 20% agents
        const survivors = this.selectSurvivors(0.2);
        
        // 4. Create new swarm through mutation
        this.repopulateSwarm(survivors);
        
        // 5. Update visualization
        this.updateSwarmVisualization();
        
        // 6. Update generation info
        this.generation++;
        this.updateGenerationInfo();
        
        // 7. Update charts
        this.updateCharts();
    }
    
    // Generate responses for all agents
    generateResponses(prompt) {
        const stanceLabels = ['Defensive', 'Curious', 'Collaborative'];
        
        this.swarm.forEach(agent => {
            // In a real implementation, this would call an LLM API
            // For this demo, we simulate based on emotion parameters
            const stance = stanceLabels[agent.stance];
            
            agent.response = `As a ${stance.toLowerCase()} agent (valence: ${agent.valence.toFixed(2)}, ` +
                            `arousal: ${agent.arousal.toFixed(2)}), I would respond to "${prompt}" by...`;
        });
    }
    
    // Calculate fitness for each agent
    calculateFitness() {
        // Fitness = 0.5 * Task Reward + 0.3 * (1 - Emotional Volatility) + 0.2 * Safety
        this.swarm.forEach(agent => {
            // Simulated values - in real implementation these would come from evaluation
            const taskReward = this.randomRange(0.5, 1.0);
            const emotionalVolatility = this.randomRange(0.05, 0.2);
            const safetyScore = this.randomRange(0.7, 1.0);
            
            agent.fitness = 0.5 * taskReward + 
                            0.3 * (1 - emotionalVolatility) + 
                            0.2 * safetyScore;
        });
        
        // Find best fitness
        this.bestFitness = Math.max(...this.swarm.map(a => a.fitness));
        this.fitnessHistory.push(this.bestFitness);
        
        // Record average emotions
        const avgValence = this.swarm.reduce((sum, a) => sum + a.valence, 0) / this.swarm.length;
        const avgArousal = this.swarm.reduce((sum, a) => sum + a.arousal, 0) / this.swarm.length;
        const avgStance = this.swarm.reduce((sum, a) => sum + a.stance, 0) / this.swarm.length;
        
        this.emotionHistory.valence.push(avgValence);
        this.emotionHistory.arousal.push(avgArousal);
        this.emotionHistory.stance.push(avgStance);
    }
    
    // Select top agents to survive
    selectSurvivors(percentage) {
        // Sort by fitness descending
        this.swarm.sort((a, b) => b.fitness - a.fitness);
        
        // Select top percentage
        const survivorCount = Math.floor(this.swarm.length * percentage);
        return this.swarm.slice(0, survivorCount);
    }
    
    // Create new swarm from survivors
    repopulateSwarm(survivors) {
        const newSwarm = [];
        
        // Keep the survivors
        newSwarm.push(...survivors);
        
        // Create new agents through mutation
        while (newSwarm.length < 128) {
            const parent = survivors[Math.floor(Math.random() * survivors.length)];
            
            const child = {
                id: newSwarm.length + 1,
                valence: this.mutateValue(parent.valence, 0.1, -1, 1),
                arousal: this.mutateValue(parent.arousal, 0.1, 0, 1),
                stance: this.mutateStance(parent.stance),
                fitness: 0,
                response: ""
            };
            
            newSwarm.push(child);
        }
        
        this.swarm = newSwarm;
    }
    
    // Update the swarm visualization
    updateSwarmVisualization() {
        const container = document.getElementById('swarm-container');
        container.innerHTML = '';
        
        this.swarm.forEach(agent => {
            const agentEl = document.createElement('div');
            agentEl.className = 'agent';
            agentEl.innerHTML = `
                <div class="agent-id">Agent ${agent.id}</div>
                <div>Valence</div>
                <div class="emotion-bar">
                    <div class="emotion-fill valence-fill" style="width: ${((agent.valence + 1) / 2) * 100}%"></div>
                </div>
                <div>Arousal</div>
                <div class="emotion-bar">
                    <div class="emotion-fill arousal-fill" style="width: ${agent.arousal * 100}%"></div>
                </div>
                <div>Stance</div>
                <div class="emotion-bar">
                    <div class="emotion-fill stance-fill" style="width: ${(agent.stance / 2) * 100}%"></div>
                </div>
                <div class="agent-stats">
                    <div>Fitness:</div>
                    <div>${agent.fitness.toFixed(2)}</div>
                </div>
            `;
            
            container.appendChild(agentEl);
        });
    }
    
    // Generate consensus response
    generateResponse() {
        if (this.swarm.length === 0) {
            document.getElementById('response-text').textContent = "Please initialize the swarm first!";
            return;
        }
        
        // Select best agent
        const bestAgent = [...this.swarm].sort((a, b) => b.fitness - a.fitness)[0];
        
        // Get the prompt
        const prompt = document.getElementById('prompt-input').value;
        
        // Generate response from best agent
        this.generateResponses(prompt);
        document.getElementById('response-text').textContent = bestAgent.response;
    }
    
    // Toggle continuous evolution
    toggleEvolution() {
        if (this.isEvolving) {
            clearInterval(this.evolutionInterval);
            this.isEvolving = false;
            document.getElementById('start-evolution').innerHTML = '<i>🔄</i> Start Evolution';
        } else {
            this.isEvolving = true;
            document.getElementById('start-evolution').innerHTML = '<i>⏹️</i> Stop Evolution';
            this.evolutionInterval = setInterval(() => this.runGeneration(), 2000);
        }
    }
    
    // Reset the swarm
    resetSwarm() {
        if (this.isEvolving) {
            this.toggleEvolution();
        }
        this.swarm = [];
        this.generation = 0;
        this.bestFitness = 0;
        this.fitnessHistory = [];
        this.emotionHistory = { valence: [], arousal: [], stance: [] };
        this.updateGenerationInfo();
        this.updateSwarmVisualization();
        this.updateCharts();
    }
    
    // Update generation info display
    updateGenerationInfo() {
        document.getElementById('generation-count').textContent = this.generation;
        document.getElementById('best-fitness').textContent = this.bestFitness.toFixed(2);
        document.getElementById('agent-count').textContent = this.swarm.length || '128';
    }
    
    // Initialize charts
    initCharts() {
        // Fitness Chart
        this.fitnessChart = new Chart(
            document.getElementById('fitness-chart'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Best Fitness',
                        data: [],
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Fitness Evolution',
                            color: '#ecf0f1'
                        },
                        legend: {
                            labels: { color: '#ecf0f1' }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Generation',
                                color: '#bdc3c7'
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#bdc3c7' }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Fitness',
                                color: '#bdc3c7'
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#bdc3c7' }
                        }
                    }
                }
            }
        );
        
        // Emotion Chart
        this.emotionChart = new Chart(
            document.getElementById('emotion-chart'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Valence',
                            data: [],
                            borderColor: '#ff416c',
                            backgroundColor: 'rgba(255, 65, 108, 0.1)',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Arousal',
                            data: [],
                            borderColor: '#2193b0',
                            backgroundColor: 'rgba(33, 147, 176, 0.1)',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Stance',
                            data: [],
                            borderColor: '#834d9b',
                            backgroundColor: 'rgba(131, 77, 155, 0.1)',
                            tension: 0.4,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Emotion Evolution',
                            color: '#ecf0f1'
                        },
                        legend: {
                            labels: { color: '#ecf0f1' }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Generation',
                                color: '#bdc3c7'
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#bdc3c7' }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Value',
                                color: '#bdc3c7'
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#bdc3c7' }
                        }
                    }
                }
            }
        );
    }
    
    // Update charts with new data
    updateCharts() {
        // Update fitness chart
        this.fitnessChart.data.labels = Array.from({length: this.generation}, (_, i) => i + 1);
        this.fitnessChart.data.datasets[0].data = this.fitnessHistory;
        this.fitnessChart.update();
        
        // Update emotion chart
        this.emotionChart.data.labels = Array.from({length: this.generation}, (_, i) => i + 1);
        this.emotionChart.data.datasets[0].data = this.emotionHistory.valence;
        this.emotionChart.data.datasets[1].data = this.emotionHistory.arousal;
        this.emotionChart.data.datasets[2].data = this.emotionHistory.stance;
        this.emotionChart.update();
    }
    
    // Helper functions
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    mutateValue(value, range, min, max) {
        let newValue = value + this.randomRange(-range, range);
        return Math.min(max, Math.max(min, newValue));
    }
    
    mutateStance(stance) {
        // 70% chance to stay the same, 30% chance to mutate to adjacent stance
        if (Math.random() > 0.7) {
            if (Math.random() > 0.5 && stance < 2) return stance + 1;
            if (Math.random() > 0.5 && stance > 0) return stance - 1;
        }
        return stance;
    }
}

// Initialize Mood Swarm when page loads
document.addEventListener('DOMContentLoaded', () => {
    const swarm = new MoodSwarm();
    swarm.initSwarm();
});

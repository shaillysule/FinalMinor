import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './styles.css';

// Set the base URL for Axios to the backend
axios.defaults.baseURL = 'http://localhost:5000';

const LearningPage = () => {
  const [modules, setModules] = useState([]);
  const [userProgress, setUserProgress] = useState({ completedModules: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch local modules from your database
        const localModulesResponse = await axios.get('/api/learning/modules');
        console.log('Fetched local modules:', localModulesResponse.data);

        setModules(localModulesResponse.data);

        // Fetch user progress (requires authentication)
        try {
          const progressResponse = await axios.get('/api/learning', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setUserProgress(progressResponse.data);
        } catch (err) {
          console.log('User not logged in or no progress data:', err.message);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const markModuleComplete = async (moduleId) => {
    try {
      console.log('Marking module as complete:', moduleId);
      const response = await axios.post(
        '/api/learning/complete-module',
        { moduleId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      console.log('Mark as complete response:', response.data);
      setUserProgress(response.data);
    } catch (err) {
      console.error('Error marking module as complete:', err.response?.data || err.message);
    }
  };

  if (loading) return <div>Loading learning modules...</div>;

  const beginnerModules = modules.filter(module => module.difficulty === 'Beginner');
  const intermediateModules = modules.filter(module => module.difficulty === 'Intermediate');
  const advancedModules = modules.filter(module => module.difficulty === 'Advanced');

  return (
    <div className="learning-page">
      <h1>Stock Market Learning Center</h1>
      <p>Enhance your knowledge and become a better investor</p>

      {beginnerModules.length > 0 ? (
        <div className="module-section">
          <h2>Beginner Modules</h2>
          <div className="module-cards">
            {beginnerModules.map((module) => (
              <div key={module._id} className="module-card">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div className="module-meta">
                  <span>{module.estimatedTime} minutes</span>
                </div>
                {userProgress.completedModules.includes(module._id) ? (
                  <span className="completed-badge">Completed</span>
                ) : (
                  <button
                    onClick={() => markModuleComplete(module._id)}
                    className="btn btn-primary"
                  >
                    Mark as Complete
                  </button>
                )}
                <Link to={`/learning/${module._id}`} className="btn btn-secondary">
                  View Module
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No beginner modules available.</p>
      )}

      {intermediateModules.length > 0 ? (
        <div className="module-section">
          <h2>Intermediate Modules</h2>
          <div className="module-cards">
            {intermediateModules.map((module) => (
              <div key={module._id} className="module-card">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div className="module-meta">
                  <span>{module.estimatedTime} minutes</span>
                </div>
                {userProgress.completedModules.includes(module._id) ? (
                  <span className="completed-badge">Completed</span>
                ) : (
                  <button
                    onClick={() => markModuleComplete(module._id)}
                    className="btn btn-primary"
                  >
                    Mark as Complete
                  </button>
                )}
                <Link to={`/learning/${module._id}`} className="btn btn-secondary">
                  View Module
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No intermediate modules available.</p>
      )}

      {advancedModules.length > 0 ? (
        <div className="module-section">
          <h2>Advanced Modules</h2>
          <div className="module-cards">
            {advancedModules.map((module) => (
              <div key={module._id} className="module-card">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div className="module-meta">
                  <span>{module.estimatedTime} minutes</span>
                </div>
                {userProgress.completedModules.includes(module._id) ? (
                  <span className="completed-badge">Completed</span>
                ) : (
                  <button
                    onClick={() => markModuleComplete(module._id)}
                    className="btn btn-primary"
                  >
                    Mark as Complete
                  </button>
                )}
                <Link to={`/learning/${module._id}`} className="btn btn-secondary">
                  View Module
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No advanced modules available.</p>
      )}
    </div>
  );
};

export default LearningPage;
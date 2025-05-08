import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './styles.css';

const ModuleDetailPage = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        console.log('Fetching module with ID:', moduleId);
        const response = await axios.get(`/api/learning/modules/${moduleId}`);
        console.log('Module data:', response.data);
        setModule(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching module:', err.response?.data || err.message);
        setLoading(false);
      }
    };
    fetchModule();
  }, [moduleId]);

  if (loading) return <div>Loading module...</div>;
  if (!module) return <div>Module not found.</div>;

  return (
    <div className="module-detail-page">
      <h1>{module.title}</h1>
      <p className="module-description">{module.description}</p>
      <div className="module-meta">
        <span>Difficulty: {module.difficulty}</span> | <span>{module.estimatedTime} minutes</span>
      </div>

      {module.lessons && module.lessons.length > 0 ? (
        <div className="lessons">
          {module.lessons.map((lesson) => (
            <div key={lesson.step} className="lesson">
              <h3>Step {lesson.step}: {lesson.title}</h3>
              <p>{lesson.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No lessons available for this module.</p>
      )}
    </div>
  );
};

export default ModuleDetailPage;
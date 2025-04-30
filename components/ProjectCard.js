import React from 'react';
import Link from 'next/link';

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition duration-300">
      <h3 className="text-xl font-bold mb-2">{project?.title || 'Projeto OAB'}</h3>
      <p className="text-gray-600 mb-4">{project?.description || 'Descrição do projeto'}</p>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {project?.date && <p>Data: {project.date}</p>}
          {project?.status && (
            <p className="mt-1">
              Status: <span className={`font-semibold ${
                project.status === 'Em andamento' ? 'text-yellow-600' : 
                project.status === 'Concluído' ? 'text-green-600' : 
                'text-blue-600'
              }`}>{project.status}</span>
            </p>
          )}
        </div>
        
        {project?.id && (
          <Link href={`/projeto/${project.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">
            Ver detalhes
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
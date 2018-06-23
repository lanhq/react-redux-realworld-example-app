import ArticleActions from './ArticleActions';
import { Link } from 'react-router-dom';
import React from 'react';

const ArticleMeta = props => {
  const article = props.article;
  return (
    <div className="article-meta">
      {/* <Link to={`/@${article.author.name}`}>
        <img src={article.author.image} alt={article.author.name} />
      </Link> */}

      <div className="info">
        {/* <Link to={`/@${article.author.name}`} className="author">
          {article.author.name}
        </Link> */}
        <span className="date">
          {new Date(article.createdAt).toDateString()}
        </span>
      </div>

      <ArticleActions canModify={props.canModify} article={article} />
    </div>
  );
};

export default ArticleMeta;

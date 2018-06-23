import React from 'react';
import AWS from "aws-sdk";

const Tags = props => {
  const tags = props.tags;
  if (tags) {
    return (
      <div className="tag-list">
        {
          tags.map(tag => {
            const handleClick = ev => {
              ev.preventDefault();
              const docClient = new AWS.DynamoDB.DocumentClient();
              docClient.scan({
                  TableName : "Articles2"
              }, function (err, data) {
                if (err) {
                  console.error(err);
                } else {
                  props.onClickTag(tag, null, {
                    articles: data.Items,
                    articlesCount: data.Items.length
                  });
                }
              })
            };

            return (
              <a
                href=""
                className="tag-default tag-pill"
                key={tag}
                onClick={handleClick}>
                {tag}
              </a>
            );
          })
        }
      </div>
    );
  } else {
    return (
      <div>Loading Tags...</div>
    );
  }
};

export default Tags;

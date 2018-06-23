import ArticleList from '../ArticleList';
import React from 'react';
import { connect } from 'react-redux';
import { CHANGE_TAB } from '../../constants/actionTypes';
import AWS from "aws-sdk";
import cognito from "../../cognito";

const YourFeedTab = props => {
  if (cognito.getCurrentUser()) {
    const clickHandler = ev => {
      ev.preventDefault();
      const docClient = new AWS.DynamoDB.DocumentClient();
      docClient.scan({
          TableName : "Articles2"
      }, function (err, data) {
        if (err) {
          console.error(err);
        } else {
          props.onTabClick('feed', null, {
            articles: data.Items,
            articlesCount: data.Items.length
          });
        }
      })
      // props.onTabClick('feed', agent.Articles.feed, agent.Articles.feed());
    }

    return (
      <li className="nav-item">
        <a  href=""
            className={ props.tab === 'feed' ? 'nav-link active' : 'nav-link' }
            onClick={clickHandler}>
          Your Feed
        </a>
      </li>
    );
  }
  return null;
};

const GlobalFeedTab = props => {
  const clickHandler = ev => {
    ev.preventDefault();
    const docClient = new AWS.DynamoDB.DocumentClient();
      docClient.scan({
          TableName : "Articles2"
      }, function (err, data) {
        props.onTabClick('all', null, {
          articles: data.Items,
          articlesCount: data.Items.length
        });
      })
    // props.onTabClick('all', agent.Articles.all, agent.Articles.all());
  };
  return (
    <li className="nav-item">
      <a
        href=""
        className={ props.tab === 'all' ? 'nav-link active' : 'nav-link' }
        onClick={clickHandler}>
        Global Feed
      </a>
    </li>
  );
};

const TagFilterTab = props => {
  if (!props.tag) {
    return null;
  }

  return (
    <li className="nav-item">
      <a href="" className="nav-link active">
        <i className="ion-pound"></i> {props.tag}
      </a>
    </li>
  );
};

const mapStateToProps = state => ({
  ...state.articleList,
  tags: state.home.tags
});

const mapDispatchToProps = dispatch => ({
  onTabClick: (tab, pager, payload) => dispatch({ type: CHANGE_TAB, tab, pager, payload })
});

const MainView = props => {
  return (
    <div className="col-md-9">
      <div className="feed-toggle">
        <ul className="nav nav-pills outline-active">

          <YourFeedTab
            tab={props.tab}
            onTabClick={props.onTabClick} />

          <GlobalFeedTab tab={props.tab} onTabClick={props.onTabClick} />

          <TagFilterTab tag={props.tag} />

        </ul>
      </div>

      <ArticleList
        pager={props.pager}
        articles={props.articles}
        loading={props.loading}
        articlesCount={props.articlesCount}
        currentPage={props.currentPage} />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MainView);

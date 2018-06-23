import Banner from './Banner';
import MainView from './MainView';
import React from 'react';
import Tags from './Tags';
import { connect } from 'react-redux';
import {
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  APPLY_TAG_FILTER
} from '../../constants/actionTypes';
import cognito from '../../cognito';
import AWS from "aws-sdk";

const mapStateToProps = state => ({
  ...state.home,
  appName: state.common.appName
});

const mapDispatchToProps = dispatch => ({
  onClickTag: (tag, pager, payload) =>
    dispatch({ type: APPLY_TAG_FILTER, tag, pager, payload }),
  onLoad: (tab, pager, payload) =>
    dispatch({ type: HOME_PAGE_LOADED, tab, pager, payload }),
  onUnload: () =>
    dispatch({  type: HOME_PAGE_UNLOADED })
});

class Home extends React.Component {
  componentWillMount() {
    const tab = cognito.getCurrentUser() ? 'feed' : 'all';
    // const articlesPromise = this.props.token && false ?
    //   agent.Articles.feed :
    //   agent.Articles.all;
    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: "Tags",
        Key:{
            "id": 1
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // console.log("GetItem succeeded:", JSON.stringify(data.Item.tags, null, 2));
            this.props.onLoad(tab, null, {tags: data.Item.tags});
        }
    }.bind(this));

  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    return (
      <div className="home-page">

        <Banner token={this.props.token} appName={this.props.appName} />

        <div className="container page">
          <div className="row">
            <MainView />

            <div className="col-md-3">
              <div className="sidebar">

                <p>Popular Tags</p>

                <Tags
                  tags={this.props.tags}
                  onClickTag={this.props.onClickTag} />

              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

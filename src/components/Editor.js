import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
import {
  ADD_TAG,
  EDITOR_PAGE_LOADED,
  REMOVE_TAG,
  ARTICLE_SUBMITTED,
  EDITOR_PAGE_UNLOADED,
  UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';
import AWS from "aws-sdk";

const mapStateToProps = state => ({
  ...state.editor,
  currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
  onAddTag: () =>
    dispatch({ type: ADD_TAG }),
  onLoad: payload =>
    dispatch({ type: EDITOR_PAGE_LOADED, payload }),
  onRemoveTag: tag =>
    dispatch({ type: REMOVE_TAG, tag }),
  onSubmit: payload =>
    dispatch({ type: ARTICLE_SUBMITTED, payload }),
  onUnload: payload =>
    dispatch({ type: EDITOR_PAGE_UNLOADED }),
  onUpdateField: (key, value) =>
    dispatch({ type: UPDATE_FIELD_EDITOR, key, value })
});

class Editor extends React.Component {
  constructor() {
    super();

    const updateFieldEvent =
      key => ev => this.props.onUpdateField(key, ev.target.value);
    this.changeTitle = updateFieldEvent('title');
    this.changeDescription = updateFieldEvent('description');
    this.changeBody = updateFieldEvent('body');
    this.changeTagInput = updateFieldEvent('tagInput');
    this.updateArticle = this.updateArticle.bind(this);
    this.createArticle = this.createArticle.bind(this);

    this.watchForEnter = ev => {
      if (ev.keyCode === 13) {
        ev.preventDefault();
        this.props.onAddTag();
      }
    };

    this.removeTagHandler = tag => () => {
      this.props.onRemoveTag(tag);
    };

    this.submitForm = ev => {
      ev.preventDefault();
      const article = {
        id: this.props.id || (new Date()).getTime(),
        title: this.props.title,
        description: this.props.description,
        body: this.props.body,
        tagList: this.props.tagList
      };

      const callback = (err, result) => {
          if(err) {
            console.error('create or update article failed: ', err);
            this.props.onSubmit({errors: err});
          } else {
            this.props.onSubmit({article: article});
          }
      };

      if (this.props.id) {
        this.updateArticle(article, callback);
      } else {
        this.createArticle(article, callback);
      }
    };
  }

  updateArticle(article, callback) {
    article.author = this.props.currentUser;
    article.author.image = "https://static.productionready.io/images/smiley-cyrus.jpg";
    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName : "Articles2",
        Item: article
    };

    docClient.update(params, callback);
  }

  createArticle(article, callback) {
    article.author = this.props.currentUser;
    article.author.image = "https://static.productionready.io/images/smiley-cyrus.jpg";
    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName : "Articles2",
        Item: article
    };

    docClient.put(params, callback);
  }

  loadArticle(id) {
    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: 'Articles2',
        Key:{
            "id": id
        }
    };
    const callback = (err, result) => {
      if (err) {
        this.props.onLoad({
          errors: err
        });
      } else {
        this.props.onLoad({
          article: result
        });
      }
    };
    docClient.get(params, callback);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      if (nextProps.match.params.id) {
        this.props.onUnload();
        
        this.loadArticle(
          this.props.match.params.id
        );
        return;
      }
      this.props.onLoad(null);
    }
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      this.loadArticle(
        this.props.match.params.id,
        this.props.match.params.title
      );
      return this.props.onLoad(agent.Articles.get(this.props.match.params.id));
    }
    this.props.onLoad(null);
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    return (
      <div className="editor-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-10 offset-md-1 col-xs-12">

              <ListErrors errors={this.props.errors}></ListErrors>

              <form>
                <fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Article Title"
                      value={this.props.title}
                      onChange={this.changeTitle} />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="What's this article about?"
                      value={this.props.description}
                      onChange={this.changeDescription} />
                  </fieldset>

                  <fieldset className="form-group">
                    <textarea
                      className="form-control"
                      rows="8"
                      placeholder="Write your article (in markdown)"
                      value={this.props.body}
                      onChange={this.changeBody}>
                    </textarea>
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter tags"
                      value={this.props.tagInput}
                      onChange={this.changeTagInput}
                      onKeyUp={this.watchForEnter} />

                    <div className="tag-list">
                      {
                        (this.props.tagList || []).map(tag => {
                          return (
                            <span className="tag-default tag-pill" key={tag}>
                              <i  className="ion-close-round"
                                  onClick={this.removeTagHandler(tag)}>
                              </i>
                              {tag}
                            </span>
                          );
                        })
                      }
                    </div>
                  </fieldset>

                  <button
                    className="btn btn-lg pull-xs-right btn-primary"
                    type="button"
                    disabled={this.props.inProgress}
                    onClick={this.submitForm}>
                    Publish Article
                  </button>

                </fieldset>
              </form>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);

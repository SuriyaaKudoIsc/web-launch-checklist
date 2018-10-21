import React from 'react';
import PropTypes from 'prop-types';
import {graphql} from 'gatsby';
import styled, {keyframes} from 'styled-components';
import 'typeface-rubik';
import MainLayout from '../components/layout';
import check from '../images/check.svg';
import {colors} from '../styles/variables';

// TODO: change max-width to breakpoint system, use react.coms?
const FormContainer = styled.main.attrs({id: 'content'})`
  max-width: 1260px;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  break-inside: avoid;
  margin: 0 auto;

  fieldset {
    background-color: #fff;
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    padding: 1.15rem 1rem 1rem;
    border-radius: 3px;
    height: min-content;

    h2 {
      margin-top: 0;
      font-weight: 500;
    }
  }
`;

const PostContainer = styled.div`
  padding: 0 1rem 0 0;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
`;

const wiggle = keyframes`
  from {
    transform: scale(1, 1);
  }

  30% {
    transform: scale(1.15, .65);
}

  40% {
    transform: scale(.65, 1.15);
}

  50% {
    transform: scale(1.05, .75);
}

  65% {
    transform: scale(.85, .95);
}

  75% {
    transform: scale(.95, .85);
}

  to {
    transform: scale(1, 1);
  }
`;

const Input = styled.input.attrs({type: 'checkbox'})`
  align-self: center;
  z-index: 1;
  width: 20px;
  height: 20px;
  left: 0;
  right: 0;
  cursor: pointer;
  position: absolute;
  border: none;
  outline: none;
  opacity: 0;
  margin: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  transition: background-color 0.1s ease-in, color 0.1s ease-in;

  &:focus,
  &:hover {
    & + .post__checkbox .checkbox__outer {
      background-color: ${colors.backgroundDarker};
    }
  }

  // Styles for the indicator when the input is checked
  &:checked {
    & + .post__checkbox {
      .checkbox__outer {
        background-color: ${colors.accent};
        animation: ${wiggle} 300ms ease;
      }

      .checkbox__inner {
        visibility: visible;
        transform: scale(1);
      }
    }

    &:focus,
    &:hover {
      & + .post__checkbox .checkbox__outer {
        background-color: ${colors.accentDark};
      }
    }
  }
`;

const Checkbox = styled.div.attrs({className: 'post__checkbox', 'aria-hidden': 'true'})`
  height: 20px;
  display: flex;
  align-items: center;
  z-index: 0;

  .checkbox__outer {
    width: 20px;
    height: 20px;
    position: relative;
    transition: background-color 200ms ease-in-out;
    background-color: ${colors.backgroundDark};
    border-radius: 3px;
  }

  .checkbox__inner {
    visibility: hidden;
    width: 14px;
    height: 14px;
    margin: 3px;
    transform: scale(1.15);
    transition: all 200ms ease-in-out;
    background-size: contain;
    background: url(${check}) no-repeat 50%;
  }
`;

const CheckboxTitle = styled.span`
  margin: 0 0 0 8px;
  cursor: pointer;
  font-size: 17px;
  color: ${colors.headingText};

  &.title--checked {
    transition: all 175ms ease;
    text-decoration: line-through;
    opacity: 0.65;
  }

  &:hover,
  &:focus {
    color: ${colors.textDark};
  }
`;

const PostRow = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0;
  border: 0;
  cursor: pointer;
  justify-content: flex-start;
`;

const PostInfo = styled.div.attrs({className: 'post__info-container'})`
  visibility: collapse;
  transition: max-height 300ms ease-in;
  will-change: max-height, visibility;
  max-height: 0;

  &.info-container--opened {
    visibility: visible;
    max-height: min-content;
    padding-bottom: 0.75em;
    margin-top: 0.55em;
    border-bottom: 1px solid ${colors.border};
    transition-timing-function: ease-out;
  }

  p:first-child {
    margin-top: 0;
  }
`;

// TODO: change "memo" name
const groupByCategory = arr =>
  arr.reduce((memo, edge) => {
    const node = edge.node.frontmatter;
    if (!memo[node['category']]) {
      memo[node['category']] = [];
    }
    memo[node['category']].push(edge);
    return memo;
  }, {});

class Home extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      allMarkdownRemark: PropTypes.shape({
        edges: PropTypes.arrayOf(
          PropTypes.shape({
            node: PropTypes.object.isRequired,
          })
        ),
      }),
    }).isRequired,
  };

  state = {
    postsStatus: {},
  };

  handleChecklistChange = (e, category, id) => {
    const {postsStatus} = this.state;
    const element = e.target;

    // check if the checkbox is being checked or unchecked
    postsStatus[category][id].checked = !!element.checked;

    // Update React state
    this.setState({
      postsStatus,
    });

    // Update local storage
    localStorage.setItem('postsStatus', JSON.stringify(postsStatus));
  };

  handleChecklistReset = () => {
    const {postsStatus} = this.state;

    // Loop through each object and set to false
    Object.keys(postsStatus).forEach(category => {
      Object.keys(postsStatus[category]).forEach(postId => {
        postsStatus[category][postId].checked = false;
        postsStatus[category][postId].opened = false;
      });
    });

    // Update React state
    this.setState({
      postsStatus,
    });

    // Update local storage
    localStorage.removeItem('postsStatus');
  };

  // TODO: can this be done better?
  handleExpand = (category, id) => {
    const {postsStatus} = this.state;

    postsStatus[category][id].opened = !postsStatus[category][id].opened;

    // Update React state
    this.setState({
      postsStatus,
    });

    // Update local storage
    localStorage.setItem('postsStatus', JSON.stringify(postsStatus));
  };

  constructor(props) {
    super(props);

    this.categorizedPosts = groupByCategory(props.data.allMarkdownRemark.edges);

    // Set up the data structure holding each posts open and checked status
    for (let key in this.categorizedPosts) {
      const {postsStatus} = this.state;
      const postsInCategory = {};
      this.categorizedPosts[key].forEach(post => {
        postsInCategory[post.node.id] = {
          checked: false,
          opened: false,
        };
      });
      postsStatus[key] = postsInCategory;
    }
  }

  componentDidMount() {
    this.hydrateStateWithLocalStorage();
  }

  hydrateStateWithLocalStorage() {
    if (Object.prototype.hasOwnProperty.call(localStorage, 'postsStatus')) {
      // get the key's value from localStorage
      let value = localStorage.getItem('postsStatus');

      // parse the localStorage string and setState
      try {
        value = JSON.parse(value);
        this.setState({postsStatus: value});
      } catch (e) {
        // handle empty string
      }
    }
  }

  render() {
    const {postsStatus} = this.state;

    return (
      <MainLayout>
        <input
          onClick={this.handleChecklistReset}
          type="reset"
          value="Reset"
          title="Reset Checkboxes"
        />
        <FormContainer>
          {Object.keys(this.categorizedPosts).map(category => (
            <fieldset key={category}>
              <h2>{category}</h2>
              {this.categorizedPosts[category].map(post => {
                const {id, frontmatter, html} = post.node;
                return (
                  <PostContainer key={id}>
                    <PostRow>
                      <Input
                        value={frontmatter.title}
                        checked={postsStatus[category][id].checked}
                        onChange={e => this.handleChecklistChange(e, category, id)}
                      />
                      <Checkbox>
                        <div className="checkbox__outer">
                          <div className="checkbox__inner" />
                        </div>
                      </Checkbox>
                      <CheckboxTitle
                        onClick={() => this.handleExpand(category, id)}
                        className={postsStatus[category][id].checked && 'title--checked'}>
                        {frontmatter.title}
                      </CheckboxTitle>
                    </PostRow>
                    <PostInfo
                      className={postsStatus[category][id].opened && `info-container--opened`}
                      dangerouslySetInnerHTML={{__html: html}}
                    />
                  </PostContainer>
                );
              })}
            </fieldset>
          ))}
        </FormContainer>
      </MainLayout>
    );
  }
}

export default Home;

// eslint-disable-next-line no-undef
export const pageQuery = graphql`
  {
    allMarkdownRemark {
      edges {
        node {
          id
          html
          frontmatter {
            title
            category
          }
        }
      }
    }
  }
`;

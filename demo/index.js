import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { compose } from 'recompose';

const applyUpdateResult = (result) => prevState => ({
  hits: [...prevState.hits, ...result.hits],
  page: result.page,
  isLoading: false,
})

const applyResult = (result) => (prevState) => ({
  hits: result.hits,
  page: result.page,
  isLoading: false,
})

const getHackerNewsUrl = (value, page) =>
  `https://hn.algolia.com/api/v1/search?query=${value}&page=${page}&hitsPerPage=100`;

export default class Demo extends  Component{
  constructor(props){
    super(props);
    this.state = {
      page: null,
      hits: [],
      isLoading: false,
    }
    this.onInitialSearch = this.onInitialSearch.bind(this);
    this.onSetResult = this.onSetResult.bind(this);
    this.fetchStories = this.fetchStories.bind(this);
    this.onPaginatedSearch = this.onPaginatedSearch.bind(this);
  }

  onInitialSearch(e){
    e.preventDefault();
    const { value } = this.input;
    if (value === '') return;
    this.fetchStories(value,0)
  }

  fetchStories (value, page) {
    this.setState({
      isLoading: true,
    })
    fetch(getHackerNewsUrl(value, page))
      .then( response => response.json())
      .then( result => this.onSetResult(result, page) )
  }

  onPaginatedSearch(value,page){
    this.fetchStories(this.input.value,this.state.page+1)
  }

  onSetResult(result, page){
    page === 0
      ? this.setState(applyResult(result))
      : this.setState(applyUpdateResult(result))
  }

  render (){
    //return <div>Hello</div>
    return (
      <div className='page'>
        <div className='interactions'>
          <form type='submit' onSubmit={this.onInitialSearch}>
            <input type="text" ref={node=>this.input = node}/>
            <button type="submit">Search</button>
          </form>
        </div>
        <ListWithLoadingWithInfinite
          list={this.state.hits}
          page={this.state.page}
          onPaginatedSearch={this.onPaginatedSearch}
          isLoading={this.state.isLoading}
        />

      </div>
    );
  }
}

const List = ({ list }) =>
  <div className="list">
    {list.map(item => <div className="list-row" key={item.objectID}>
      <a href={item.url}>{item.title}</a>
    </div>)}
  </div>

// Let!s use HOCs

const withLoading = (Component) => (props) =>
  <div>
    <Component {...props} />
    <div className='interactions'>
      {props.isLoading && <span>Loading...</span>}
    </div>
  </div>

const withPaginated = (Component) => (props) =>
  <div>
    <Component {...props} />
    <div className='interactions'>
    {
      (props.page !== null && !props.isLoading) &&
      <button
        type="button"
        onClick = {props.onPaginatedSearch}
      >
        More
      </button>
    }
    </div>
  </div>

const withInfiniteScroll = (Component) =>
  class WithInfiniteScroll extends React.Component{
    componentDidMount(){
      window.addEventListener('scroll', this.onScroll)
    }
    componentWillUnmount(){
      window.removeEventListener('scroll',this.onScroll)
    }
    onScroll = () => {
      if(
        (window.innerHeight + window.scrollY) >= (document.body.offsetHeight-500)&&
        this.props.list.length
      ){
        this.props.onPaginatedSearch();
      }
    }

    render(){
      return <Component {...this.props}/>
    }
  }

const ListWithLoadingWithInfinite = compose(
//  withPaginated,
  withInfiniteScroll,
  withLoading,
)(List);

ReactDOM.render(<Demo/>,document.querySelector('#content'))

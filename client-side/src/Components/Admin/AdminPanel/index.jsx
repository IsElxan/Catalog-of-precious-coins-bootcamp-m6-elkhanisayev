import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../Common/SeachBar/index';
import EachCoin from '../../Common/EachCoin/index';
import Pagination from "../../Common/Pagination/index";
import './index.scss';

class AdminPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            pageSize: 4,                // The amount of data per page
            currentPage: 1,             // Starter page for pagination
        }
    }

    componentDidMount = () => {
        this.checkAccess();
    }

    checkAccess = async() => {
        const token = localStorage.getItem('token');
        if(!token) {
            alert("Access denied");
            this.props.history.push('/sign-in'); // change to sign-in
            return;
        }
        try {
            const response  = await fetch(`http://localhost:3010/sign-in/admin-panel/${token}`);
            if(!response.ok) {
                alert("Access denied");
                this.props.history.push('/sign-in');
            }
        }
        catch(err) {
            alert("Access denied");
            this.props.history.push('/sign-in');
        }
        this.getCoins();
    }

    getCoins = async() => {
        const response  = await fetch('http://localhost:3010/coins');
        const data      = await response.json();
        if(data.length > 0 && response.ok) {
            this.setState({data});
        }
        else {
            console.log(response.status, response.statusText);
        }
    }

    handleSignOut = (e) => {
        localStorage.removeItem('token');
    }

    handleCoinDelete = async(index, id) => {
        const {data}    = this.state;
        const token     = localStorage.getItem('token');
        const options   = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({token})
        };
        try {
            const response = await fetch(`http://localhost:3010/coins/${id}`, options);
            console.log(response);
            if(response.ok) {
                const newArr = [...data];
                newArr.splice(index, 1);
                console.log(newArr)
                this.setState({data: [...newArr]});
            }
            else {
                console.log('Request failed', response.statusText);
            }
        }
        catch(err) {
            console.log('Request failed', err);
        }   
    }

    handleSearchSubmit = async(e, criteria) => {
        e.preventDefault();
        console.log(criteria);
        const searchBarMainInput    = criteria.inputValue !== undefined ? `?searchBarMainInput=${criteria.inputValue}` : '';
        const priceFrom             = criteria.priceFrom !== undefined ? `&priceFrom=${criteria.priceFrom}` : ''; 
        const priceTo               = criteria.priceTo !== undefined ? `&priceTo=${criteria.priceTo}` : '';
        const yearFrom              = criteria.yearFrom !== undefined ? `&yearFrom=${criteria.yearFrom}` : '';
        const yearTo                = criteria.yearTo !== undefined ? `&yearTo=${criteria.yearTo}` : '';
        const issuingCountry        = criteria.issuingCountry !== undefined ? `&issuingCountry=${criteria.issuingCountry}` : '';
        const composition           = criteria.composition !== undefined ? `&composition=${criteria.composition}` : '';
        const quality               = criteria.quality !== undefined ? `&quality=${criteria.quality}` : '';
        const response  = await fetch(`http://localhost:3010/coins/${searchBarMainInput}${priceFrom}${priceTo}${yearFrom}${yearTo}${issuingCountry}${composition}${quality}`);
        const data      = await response.json();
        this.setState({data});
    }

    handlePageChange = (pageNumber) => {
        this.setState({currentPage: pageNumber});
    }

    render = () => {
        const {data, pageSize, currentPage} = this.state;
        return (
            <div className="admin-panel">
                <header>
                    <h1>Admin Panel</h1>
                    <div>
                        <Link to="/sign-in" onClick={this.handleSignOut}>Sign out</Link>
                    </div>
                </header>
                <main>
                    <SearchBar handleSearchSubmit={this.handleSearchSubmit} />
                    

                    <div className="admin-panel-add-coin">
                        <Link to={`/coin/artisan/create`} className="admin-panel-create-link">
                            <div className="admin-panel-create-wrapper">
                                <div className="admin-panel-add-coin-circle">
                                    <span>+</span>
                                </div>
                                <div className="admin-panel-add-coin-text">
                                    <span>Add a new coin</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                    {
                        data.length > 0 &&
                        data.slice(pageSize * (currentPage - 1), pageSize * currentPage).map((element, index) => {
                            return (
                                <div key={element.id} className="admin-panel-per-coin slideLeft">
                                    <EachCoin {...element} />
                                    <div className="admin-panel-edit-link-wrapper">
                                        <Link to={`/coin/artisan/${element.id}`} className="admin-panel-edit-link">
                                            <span>Edit</span>
                                        </Link>
                                    </div>
                                    <div className="admin-panel-delete-btn-wrapper">
                                        <button onClick={()=> {this.handleCoinDelete(index, element.id)}} className="admin-panel-delete-btn">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )
                        }) 
                    }
                </main>
                <footer>
                    {
                        data.length > 0 &&
                        <div>
                            <Pagination 
                                coinsPerPage={pageSize} 
                                totalCoins={data.length}
                                changeCurrPage={this.handlePageChange}  
                            />
                        </div>
                    }
                </footer>
            </div>
        )
    }
}

export default AdminPanel;
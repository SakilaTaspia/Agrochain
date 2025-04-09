import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { NftContext } from '../frontend/NftContext/NftProvider';
import farmer from './farmer.png'

const Navigation = ({ web3Handler }) => {
    const { account, setAccount, accountType, setAccountType } = useContext(NftContext);
    const navigate = useNavigate();

    const logout = () => {
        setAccount('')
        setAccountType(false);
        localStorage.removeItem('account');
        navigate('/');
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-effects sticky-top">
            <NavLink className="navbar-brand super-bold" to={`/front`}><img src={farmer} style={{ width: "32px" }} /> AGRO CHAIN </NavLink>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <i className="fa fa-bars fa-fw"></i>
            </button>

            <div className="collapse navbar-collapse justify-content-end text-center" id="navbarSupportedContent">
                <ul className="navbar-nav">
                    {account &&
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active-route" : ""}`} to={`/profile`}>Profile</NavLink>
                        </li>}

                    {!account &&
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active-route" : ""}`} to={`/`}>Home</NavLink>
                        </li>
                    }
                    <li className="nav-item">
                        <NavLink className={({ isActive }) => `nav-link ${isActive ? "active-route" : ""}`} to={`/nft`}> NFT</NavLink>
                    </li>
                    {!accountType && <li className="nav-item">
                        <NavLink className="nav-btn btn btn-secondary btn-sm btn-block" to={`/register`}><i className="fa fa-sign-in-alt fa-fw"></i> Register </NavLink>
                    </li>}
                    <li className="nav-item nav-item-btn mb-2">
                        {account ? (<><button className="nav-btn btn btn-secondary btn-sm btn-block"><a href={`https://rinkeby.etherscan.io/address/${account}`} target="_blank"
                            rel="noopener noreferrer" > {account.slice(0, 5) + '...' + account.slice(38, 42)}</a></button>
                            <button onClick={logout} className="nav-btn btn btn-danger btn-sm btn-block ms-2"><i className="fa fa-sign-out-alt fa-fw"></i> Disconnect Wallet </button></>) : (
                            <button onClick={web3Handler} className="nav-btn btn btn-success btn-sm btn-block ms-2"><i className="fa fa-user-plus fa-fw"></i> Connect Wallet </button>)}
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default Navigation;

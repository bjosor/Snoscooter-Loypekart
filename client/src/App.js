import React, {Component} from 'react';
import axios from 'axios';
import './App.css';
import Map from './components/Map';
import NewPoiDialog from './components/NewPoiDialog';
import { UserProvider } from './Context'
import SideMenu from './components/SideMenu';
import LoginDialog from './components/LoginDialog';
import ServerConnection from './ServerConnection';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      creatingPoi: null,
      currentLocation: { lat: 60.0084857, lng:11.0648648 },
      showLogin: false,
      poi_data: [],
      track_data: []
    };

    this.user = {
      loggedIn: true
    }

    this.server = new ServerConnection();
    
    this.createPoi = this.createPoi.bind(this);
    this.editPoi = this.editPoi.bind(this);
    this.deletePoi = this.deletePoi.bind(this);
    this.toggleLoginDialog = this.toggleLoginDialog.bind(this);
    this.handleLogin = this.handleLogin.bind(this);


  }

  componentDidMount() {
    this.getPois().then(data => this.setState({poi_data: data}));
    this.getTracks().then(data => this.setState({track_data: data}));
  }

  async handleLogin(username, password) {
    if(username === undefined || username === null) {
      alert("Ingen brukernavn oppgitt, prøv igjen");
    }

    else if (password === undefined || password === null) {
      alert("Ingen passord oppgitt, prøv igjen");
    }
    
    else {
      const loginResponse = await this.server.login(username, password);
      console.log(loginResponse);
    }
  }

  toggleLoginDialog() {
    let toggle = this.state.showLogin;
    this.setState(prevState => ({
      currentLocation : prevState.currentLocation,
      showLogin : !toggle
    }))
  }

  render(){
    return(
      <UserProvider value={this.user}>
        <SideMenu
          openLoginMenu = {this.toggleLoginDialog}
        ></SideMenu>
        <Map 
          poi_data={this.state.poi_data}
          track_data={this.state.track_data} 
          createPoi={this.createPoi} 
          creatingPoi={this.state.creatingPoi} 
          editPoi={this.editPoi}
          deletePoi={this.deletePoi}
        />

        {this.state.creatingPoi && <NewPoiDialog 
          onDone={this.createPoi} 
          coords={this.state.creatingPoi}
          selectedPoi={{name:'', type:'Parkeringsplass'}}
        />}

        {this.state.editingPoi && <NewPoiDialog 
          onDone={this.editPoi} 
          selectedPoi={this.state.poi_data.filter((v) => (v._id===this.state.editingPoi))[0]}
        />}


        {this.state.showLogin &&
          <LoginDialog
            handleLogin={this.handleLogin}
            toggleLoginDialog={this.toggleLoginDialog}>
          </LoginDialog>
        }
      </UserProvider>
    );
  }

  // Request a list of all PoI's from the backend
  async getPois(){
    const res = await axios.get('/poi');

    let data = res.data;
    return(data);
  }

  async getTracks(){
    const res = await axios.get('/tracks');

    let data = res.data;
    return(data);
  }

  async deletePoi(id) {
    const res = await axios.delete('/poi/' + id);
    if(res.status === 201){
      const data = await this.getPois();
      this.setState({poi_data: data})
    }
  }

  // Value is either null or the id of the point that was clicked
  async editPoi(value, data){
    this.setState({editingPoi: value})
    if (value !== null){
      this.setState({selectedPoi: value})
    }

    if(data !== undefined){
      const res = await axios.patch('/poi/' + this.state.selectedPoi, data);
      if(res.status === 201){
        const data = await this.getPois();
        this.setState({poi_data: data})
      }
    }
  }

  // Controls wether we are currently making a new PoI and passes data to the backend when done
  // value is either null or an array with latitude, longitude
  async createPoi(value, data){
    this.setState({creatingPoi: value})

    if(data !== undefined){
      const res = await axios.post('/poi', data);
      if(res.status === 201){
        const data = await this.getPois();
        this.setState({poi_data: data})
      }
    }
  }
}

export default App;

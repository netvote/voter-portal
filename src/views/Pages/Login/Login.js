import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Fade, TextField, Paper, withStyles, Grid, Button, FormControl } from '@material-ui/core';
import logo from '../../../assets/img/brand/netvote_mark_512.png';
import NetvoteAPIs from '@netvote/netvote-api-sdk'
import Send from '@material-ui/icons/Send';


//Netvote Settings
import * as netvote_settings from '../../../config/netvote-settings';
const nvClient = NetvoteAPIs.initVoterClient(netvote_settings.NETVOTE_API_KEY);


const styles = theme => ({
    main: {
        width: 'auto',
        display: 'block', // Fix IE 11 issue.
        marginTop: 'auto',
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        disableUnderline: true
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
});

const getMetadata = async (electionId) => {
    let election = await nvClient.GetElection(electionId);
    let hash = election.props.metadataLocation;
    let metadata = await nvClient.GetFromIPFS(hash);
    return metadata;
}

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.electionId = this.props.match.params.electionId;
        this.submitEmail = this.submitEmail.bind(this);
        this.updateEmail = this.updateEmail.bind(this);

        getMetadata(this.electionId).then((metadata) => {
            this.setState( { 
                metadata: metadata,
                showForm: true
            } );
            
            console.log(metadata);
        })
    }

    state = {
        showForm: false,
        email: "",
        message: `Please enter your email address to receive your secure ballot link.`,
        metadata: {
            ballotTitle: "Loading..."
        }
    }

    submitEmail() {
        //TODO: validate email address
        nvClient.VerifyEmail(this.electionId, this.state.email).then((res) => {
            // res.message will be something if not valid
            this.setState({
                message: res.message
            })
            console.log(res);

        })
    }

    updateEmail(event){
        console.log(event.target.value);
        this.setState({email: event.target.value})
    }
        

    render() {
        
        const { classes } = this.props;
        // const { state } = this.state;

        //TODO: ideally have a nice transition while loading metadata
        //TODO: if election does not have authType=="email", then give error page
        return (
            <main className={classes.main}>
                {/* <CssBaseline /> */}
                

                <Paper className={classes.paper}>
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    style={{margin: "20px"}} 
                    >
                    <Grid justify="center" container spacing={8}>
                        <Grid item>
                            <img src={logo} justify="left" alt="logo" width="75" height="75" />
                        </Grid>
                    </Grid>
                    <Fade in={this.state.showForm}>
                        <Grid container>
                            <Grid style={{margin: "2px"}} justify="center" container spacing={0}>
                            <Typography align="left" variant="h6">
                                { this.state.metadata.ballotTitle }
                            </Typography>
                            </Grid>
                            <Grid style={{margin: "20px"}} justify="center" container spacing={8}>
                            <Typography align="left">
                                For your security, this election requires email verification.<br/><br/>
                            </Typography>
                            <Typography align="left">
                                { this.state.message }
                            </Typography>
                            </Grid>
                            <form className={classes.form}>
                                <FormControl required fullWidth>
                                    {/* <InputLabel htmlFor="email">Email</InputLabel> */}
                                    <TextField
                                        id="email"
                                        label="Email Address"
                                        className={classes.textField}
                                        margin="normal"
                                        onChange={this.updateEmail}
                                        />
                                </FormControl>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={this.submitEmail}
                                    className={classes.submit}
                                >
                                    Send Verification Email
                                    <Send className={classes.rightIcon}/>
                                </Button>
                            </form>
                        </Grid>
                    </Fade>
                </Grid>
                </Paper>
            </main>
        );
    }
}

Login.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Login);

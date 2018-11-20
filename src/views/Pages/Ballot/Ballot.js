import React from 'react';
import PropTypes from 'prop-types';
import { Fade, Paper, withStyles, Grid, Button } from '@material-ui/core';
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
        marginTop: theme.spacing.unit,
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

class Ballot extends React.Component {

    constructor(props) {
        super(props);
        this.electionId = this.props.match.params.electionId;
        this.token = this.props.match.params.token;

        console.log('Election Id: ' + this.electionId);
        console.log('Token: ' + this.token);
        
        this.submitBallot = this.submitBallot.bind(this);

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
        message: ``,
        metadata: {
            ballotTitle: "Loading..."
        }
    }

    //TODO: Hardcoded - need to render Vote based on dynamic Ballot Form entries
    submitBallot = async () => {
        let voteObject = {
            ballotVotes: [
                {
                    choices: [
                        {
                            selection: 0
                        },
                        {
                            selection: 0
                        },
                        {
                            selection: 0
                        }
                    ]
                }
            ]
        }

        //Delayed fire for performance improvement
        setTimeout( () => { 
            this.setState({  message: 'Sending vote'});

            nvClient.CastSignedVote(this.electionId,this.token, voteObject).then((res) => {
            if(res.txStatus === "complete" || res.txStatus === "pending"){
                // everything is good
                console.log('Vote Status: ' + res.txStatus);
                this.setState({  message: 'Vote sent'});
                // this.setState({  message: 'Vote Status: ' + res.txStatus});
            } else {
                // an error occured, or vote is a duplicate
                console.log('Vote Error: ' + res.message);
                this.setState({  message: 'Vote Error: ' + res.message});
            }
        }) }, 10);
      
    }
  
    render() {
        
        const { classes } = this.props;
        // const { state } = this.state;

        return (
            <main className={classes.main}>
                
                <Paper className={classes.paper}>
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    style={{margin: "20px"}} 
                    >
                    <Grid justify="center" container spacing={24}>
                        <Grid item>
                            <img src={this.state.metadata.featuredImage} alt="" justify="center" width="100%" height="100%" />
                        </Grid>
                    </Grid>
                    <Fade in={this.state.showForm}>
                        <Grid container>
                            <Grid style={{margin: "2px"}} justify="center" container spacing={8}>
                                <p align="center" style={{ fontSize: "1.5rem" }}>
                                    { this.state.metadata.ballotTitle }
                                </p>
                                <p align="center" style={{ fontSize: ".8rem" }}>
                                    { this.state.metadata.description }
                                </p>
                            </Grid>
                            <Grid style={{margin: "2px"}} justify="center" container spacing={8}>
                                <p align="center" variant="subtitle1"  style={{ fontWeight: "bold", color: "#22b1dd" }}>
                                    { this.state.message }
                                </p>
                            </Grid>
                            <form className={classes.form}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={this.submitBallot}
                                    className={classes.submit}
                                >
                                    Send Vote
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

Ballot.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Ballot);

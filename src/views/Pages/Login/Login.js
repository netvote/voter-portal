import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Fade, TextField, Paper, withStyles, Grid, Button, FormControl } from '@material-ui/core';
import logo from '../../../assets/img/brand/netvote_mark_512.png';
import NetvoteAPIs from '@netvote/netvote-api-sdk'
import Send from '@material-ui/icons/Send';
import * as moment from 'moment';
import * as Bowser from "bowser"; 

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

//Netvote Settings
import * as netvote_settings from '../../../config/netvote-settings';
const nvClient = NetvoteAPIs.initVoterClient(netvote_settings.NETVOTE_API_KEY);
const browser = Bowser.getParser(window.navigator.userAgent);

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
    hiddenForm: {
        width: '100%', // Fix IE 11 issue.
        disableUnderline: true,
        display: 'none'
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
    card: {
        minWidth: 275,
    },
});

function getFormattedTimestamp(timestamp) {
    let formattedTimestamp = moment(timestamp).format('MM-DD-YYYY @ hh:mm:ss A');

    return formattedTimestamp;
}


class Login extends React.Component {

    constructor(props) {
        super(props);
        this.electionId = this.props.match.params.electionId;
        this.submitEmail = this.submitEmail.bind(this);
        this.updateEmail = this.updateEmail.bind(this);

    }

    getMetadata = async (electionId) => {
        let election = await nvClient.GetElection(electionId);

        console.log(election);

        let hash = election.props.metadataLocation;

        this.setState({
            voteStartTime: election.props.voteStartTime,
            voteEndTime: election.props.voteEndTime,
            electionStatus: election.electionStatus,
            electionAuthType: election.authType,
        });

        if(election.props.requireProof){
            let notSupported = browser.satisfies({
                windows: {
                "internet explorer": "<11",
                }
            });
            
            if(notSupported){
                this.setState({
                    badBrowser: notSupported,
                    message: `${browser.getBrowserName()} ${browser.getBrowserVersion()} is not supported.  This election requires cryptographic features available in modern browsers.`
                })
            }
        }

        let metadata = await nvClient.GetFromIPFS(hash);
        return metadata;
    }

    getElectionStats = async (electionId) => {
        let electionStats = await nvClient.GetElectionStats(electionId);
        return electionStats.stats;
    }

    componentDidMount = async () => {

        await this.getMetadata(this.electionId).then((metadata) => {
            this.setState({
                metadata: metadata,
            });

            console.log(metadata);
        })

        console.log('electionStatus: ', this.state.electionStatus);
        console.log('electionAuthType: ', this.state.electionAuthType);        
        console.log(`browser: ${browser.getBrowserName()} ${browser.getBrowserVersion()}`);

        //Election redirect check
        if (this.state.electionStatus === 'voting' && this.state.electionAuthType === 'email') {

            //Election stats details
            await this.getElectionStats(this.electionId).then((electionStats) => {

                console.log('Election Stats: ', electionStats);

                this.setState({
                    votesCompletedMessage: " Votes Cast " + (electionStats.complete === undefined ? 0 : electionStats.complete),
                });

            })

            //Poll metadata details
            this.setState({
                voteStartMessage: (this.state.voteStartTime !== 0 ? 'Polls Open ' + getFormattedTimestamp(this.state.voteStartTime) : ""),
                voteEndMessage: (this.state.voteEndTime !== 0 ? 'Polls Close ' + getFormattedTimestamp(this.state.voteEndTime) : ""),
            })

            let now = new Date().getTime()
            if(this.state.voteStartTime && this.state.voteStartTime > now){
                this.setState({
                    message: "Polls are not yet open",
                    hideForm: true
                })
            } else if(this.state.voteEndTime && this.state.voteEndTime < now) {
                this.setState({
                    message: "Polls are now closed. Results will be available soon.",
                    hideForm: true
                })
            }
            this.setState({
                showForm: true
            })

        } else if (this.state.electionStatus === 'closed') {
            //Redirect to results page

            let redirectUrl = '/results/' + this.electionId;

            console.log('Redirecting to results page: ', redirectUrl);
            this.props.history.push(redirectUrl);

        } else {
            //Redirect to error page
            console.log('Redirecting to error page: ');
            this.props.history.push('/error/Expired');
        }
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
        //validate email address
        this.setState({
            message: "Verifying email address..."
        })
        nvClient.VerifyEmail(this.electionId, this.state.email).then((res) => {
            // res.message will be something if not valid
            this.setState({
                message: res.message
            })
            console.log(res);

        }).catch((e) => {
            console.log(e);
            this.setState({
                message: e.message
            })
        })
    }

    updateEmail(event) {
        console.log(event.target.value);
        this.setState({ email: event.target.value })
    }

    _handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          this.submitEmail();
        }
    }

    render() {

        const { classes } = this.props;
        // const { state } = this.state;

        //TODO: ideally have a nice transition while loading metadata
        return (
            <main className={classes.main}>
                {/* <CssBaseline /> */}


                <Paper className={classes.paper}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        style={{ margin: "20px" }}
                    >
                        <Fade in={this.state.showForm}>
                            <Grid container>
                                <Card style={{ margin: "28px", background: "#f7f7f7" }} justify="center">
                                    <CardContent justify="center">
                                        <Grid justify="center" container spacing={8}>
                                            <Grid item>
                                                <img src={logo} justify="left" alt="logo" width="75" height="75" />
                                            </Grid>
                                        </Grid>
                                        <Grid style={{ margin: "2px" }} justify="center" container spacing={0}>
                                            <Typography align="left" variant="h6">
                                                {this.state.metadata.ballotTitle}
                                            </Typography>
                                        </Grid>
                                        <Grid style={{ margin: "2px" }} justify="center" container spacing={0}>
                                            <Typography color="textSecondary">
                                                {this.state.voteStartMessage}
                                            </Typography>
                                        </Grid>
                                        <Grid style={{ margin: "2px" }} justify="center" container spacing={0}>
                                            <Typography color="textSecondary">
                                                {this.state.voteEndMessage}<br />
                                            </Typography>
                                        </Grid>
                                        <Grid style={{ margin: "2px" }} justify="center" container spacing={0}>
                                            <Typography color="textSecondary">
                                                {this.state.votesCompletedMessage}
                                            </Typography>
                                        </Grid>
                                    </CardContent>
                                </Card>
                                <Grid style={{ margin: "20px" }} justify="center" container spacing={8}>
                                    <Typography align="left" variant="body2" style={(this.state.hideForm || this.state.badBrowser) ? {display: 'none'} : {}} >
                                        For your security, this election requires email verification.<br /><br />
                                    </Typography>
                                    <Typography align="left" variant="body2" style={{ color: "#3f51b5" }}>
                                        {this.state.message}
                                    </Typography>
                                </Grid>

                                <form onSubmit={e => { e.preventDefault(); }} className={(this.state.hideForm || this.state.badBrowser) ? classes.hiddenForm : classes.form} >
                                    <FormControl required fullWidth>
                                        {/* <InputLabel htmlFor="email">Email</InputLabel> */}
                                        <TextField
                                            id="email"
                                            label="Email Address"
                                            className={classes.textField}
                                            margin="normal"
                                            onKeyPress={this._handleKeyPress}
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
                                    <Send className={classes.rightIcon} />
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

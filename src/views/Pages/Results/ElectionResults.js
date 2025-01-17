import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Fade, Paper, withStyles, Grid} from '@material-ui/core';
import logo from '../../../assets/img/brand/netvote_mark_512.png';
import NetvoteAPIs from '@netvote/netvote-api-sdk'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import {RadialChart} from 'react-vis';



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
            width: 800,
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
});

class ElectionResults extends React.Component {

    constructor(props) {
        super(props);
        // this.renderElectionResults = this.renderElectionResults.bind(this);
        this.getSectionTitles = this.getSectionTitles.bind(this);


        this.renderElectionResultsByIndex = this.renderElectionResultsByIndex.bind(this);
        this.getRawResults = this.getRawResults.bind(this);

        this.electionId = this.props.match.params.electionId;
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

        let metadata = await nvClient.GetFromIPFS(hash);


        return metadata;
    }

    getElectionResults = async (electionId) => {
        let electionGetResults = await nvClient.GetResults(electionId);

        console.log('electionGetResults(): ', electionGetResults);

        return electionGetResults;
    }

    getRawResults(_index) {
        let items = [], electionResults = [];

        let results = this.state.electionResults;

        electionResults[0] = results.ballots[results.election].results.ALL[_index];

        electionResults.forEach(function (element) {

            const entries = Object.entries(element);
            console.log(entries);

            for (const [value, count] of entries) {

                let tmpObj = {};
                //Bar Chart
                // tmpObj.y = `${value}`;
                // tmpObj.x = `${count}`;

                //Radius Chart (Donut)
                if (count !== 0) {
                    tmpObj.angle = count;
                    tmpObj.label = `${value.replace("WRITEIN-","")} (${count})`;
                    // tmpObj.subLabel = `${value}`;

                    items.push(tmpObj);
                }
            }
        });

        return items;
    }

    renderElectionResultsByIndex(_index) {

        let items = [], itemDescription;

        let results = this.state.electionResults;

        let electionResults = results.ballots[results.election].results.ALL[_index];

        let decisionMetadata = results.ballots[results.election].decisionMetadata;

        const entries = Object.entries(electionResults)

        for (const [value, count] of entries) {

            //Determine ballot description
            const ballotItems = Object.values(decisionMetadata[_index].ballotItems);

            for (const ballotValue of ballotItems) {

                if (ballotValue["itemTitle"] === value) {
                    itemDescription = ballotValue["itemDescription"] || "";
                    break;
                }
            }

            let name = `${value}: ${count}`

            if(value.indexOf("WRITEIN") > -1){
                items.push({name: value.substring("WRITEIN-".length)+" (write-in)", count: count})
            } else {
                items.push({name: value, count: count})
            }
        }

        items.sort(function(a,b){
            if(a.count > b.count) {
                return -1;
            }
            if(a.count < b.count){
                return 1
            }
            if(a.name > b.name) { 
                return 1
            }
            if(b.name < b.name){
                return -1
            }
            return 0
        })

        return items;
    }

    getSectionTitles(results) {

        let items = [];

        let decisionMetadata = results.ballots[results.election].decisionMetadata;

        decisionMetadata.forEach(function (element) {
            items.push(element.sectionTitle);
        });

        return items;
    }

    componentDidMount = async () => {

        let metadata = await this.getMetadata(this.electionId);
        this.setState({
            metadata: metadata,
        });
        console.log(metadata);
        
        //Election redirect check
        if (this.state.electionStatus === 'closed') {

            this.setState({
                title: 'Gathering results...',
            });

            //Request Election Results
            let job = await this.getElectionResults(this.electionId);

            // poll for 60 seconds
            let res = await nvClient.PollJob(job.jobId, 60000);

            //Votes Cast
            let votesCast = res.txResult.results.ballots[res.txResult.results.election].totalVotes || 0;

            console.log("Election Query Response: ", res);

            if (res.txStatus === "complete") {
                // everything is good
                // Makeshift election results rendering
                let allResults = res.txResult.results;

                let allSectionTitles = this.getSectionTitles(allResults);

                this.setState({
                    title: "Votes Cast " + votesCast,
                    electionResults: allResults,
                    electionSections: allSectionTitles,
                    message: ""
                });

            } else {

                // an error occured, or vote is a duplicate
                this.setState({
                    title: "Error",
                    message: "Unable to retrieve election results at this time.",
                });
            }

        } else {
            //Redirect to error page
            this.props.history.push('/error/Expired');
        }
    }


    state = {
        title: '',
        electionSections: [],
        message: '',
        metadata: {
            ballotTitle: "Please wait..."
        },
        electionResults: [],

    }

    render() {
        const { classes } = this.props;


        return (
            <main className={classes.main}>
                <Paper className={classes.paper}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        style={{ margin: "20px" }}
                    >
                        <Grid justify="center" container spacing={8}>
                            <Grid item>
                                <img src={logo} justify="left" alt="logo" width="75" height="75" />
                            </Grid>
                        </Grid>
                        <Fade in={true}>
                            <Grid container>
                                <Grid style={{ margin: "2px" }} justify="center" container spacing={0}>
                                    <Typography style={{ color: "#00b3a7" }} align="center" variant="h6" >
                                        {this.state.metadata.ballotTitle}
                                    </Typography>
                                </Grid>
                                <Grid style={{ margin: "2px" }} justify="center" container spacing={0}>
                                    <Typography align="center" color="textSecondary" variant="h6">
                                        {this.state.title}
                                    </Typography>
                                </Grid>
                                <Grid style={{ margin: "2px" }} justify="center" container spacing={0}>
                                    <Typography align="center" color="textSecondary">
                                        {this.state.message}
                                    </Typography>
                                </Grid>

                                <Grid style={{ margin: "2px" }} justify="center" container spacing={0}>
                                    <Typography align="center" component={'span'} color="primary">
                                        {this.state.electionSections.map(function (value, index) {
                                            return <Card key={index} style={{ margin: "28px", background: "#eceaea" }} justify="center">
                                                <CardHeader style={{ color: "#ffffffde", background: "#b1d5e2" }} title={value} subheader="" />


                                                <Grid style={{ margin: "2px" }} justify="center" container spacing={0}>
                                                    <RadialChart
                                                        data={this.getRawResults(index)}
                                                        width={300}
                                                        height={300}
                                                        innerRadius={100}
                                                        radius={50}
                                                        animation={true}
                                                        labelsAboveChildren={true}
                                                        labelsRadiusMultiplier={1.8}
                                                        showLabels={true}
                                                    />
                                                </Grid>

                                                {this.renderElectionResultsByIndex(index).map(function (val, idx) {
                                                    return <Card key={idx} style={{ margin: "28px", background: "#f7f7f7" }} justify="center">
                                                        <CardContent key={idx}>
                                                        <Grid container spacing={24}>
                                                            <Grid item xs={12} sm={6}>
                                                                <Typography align="center" color="textSecondary" variant="h6">
                                                                    {val.name}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12} sm={6}>
                                                                <Typography align="center" color="textSecondary" variant="h4">
                                                                {val.count}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                        </CardContent>
                                                    </Card>;
                                                }, this)}
                                            </Card>;
                                        }, this)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Fade>
                    </Grid>
                </Paper>
            </main >
        );
    }
}


ElectionResults.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ElectionResults);

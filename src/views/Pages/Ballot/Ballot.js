import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Fade, Paper, withStyles, Grid, Button } from '@material-ui/core';
import NetvoteAPIs from '@netvote/netvote-api-sdk'
import Send from '@material-ui/icons/Send';
import * as Survey from "survey-react";
import "survey-react/survey.css";

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
        [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
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

    let results = {
        questions: [],
        metadata: metadata,
        nvQuestions: []
    };

    let questionIdx = 0;
    for(let j=0; j<metadata.ballotGroups.length; j++){
        let ballotGroup = metadata.ballotGroups[j];
        for(let i=0; i<ballotGroup.ballotSections.length; i++){
            let section = ballotGroup.ballotSections[i];

            let question = {
                type: "radiogroup",
                name: `${questionIdx++}`,
                title: section.sectionTitle,
                isRequired: true,
                colCount: 1,
                choices: []
            }
            for(let k=0; k<section.ballotItems.length; k++){
                let choice = section.ballotItems[k];
                question.choices.push(choice.itemTitle)
            }
            results.questions.push(question);
            results.nvQuestions.push(section);
        }
    }

    return results;
}

const getIndexOfChoice = (section, choiceTxt) => {
    for(let i=0; i<section.ballotItems.length; i++){
        if(section.ballotItems[i].itemTitle == choiceTxt){
            return i;
        }
    }
    throw new Error(`Cannot find ${choiceTxt} choice in ${section.sectionTitle}`)
}

class Ballot extends React.Component {

    constructor(props) {
        super(props);
        this.electionId = this.props.match.params.electionId;
        this.token = this.props.match.params.token;

        console.log('Election Id: ' + this.electionId);
        console.log('Token: ' + this.token);

        this.submitBallot = this.submitBallot.bind(this);
        this.onComplete = this.onComplete.bind(this);


        getMetadata(this.electionId).then((surveyObj) => {

            this.setState({
                model: new Survey.Model({  	title: surveyObj.metadata.ballotTitle, completedHtml: "Your vote is recorded", questions: surveyObj.questions}),
                metadata: surveyObj.metadata,
                nvQuestions: surveyObj.nvQuestions,
                showForm: true
            });

            console.log(surveyObj);
        })
    }

    state = {
        model: new Survey.Model({
            elements: []
        }),
        nvQuestions: [],
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

        

    }

    async onComplete(survey, options) {
        //Write survey results into database
        console.log("Survey results: " + JSON.stringify(survey.data));

        let choices = [];
        for(let i=0; i<this.state.nvQuestions.length; i++){
            let choiceName = survey.data[`${i}`];
            let idx = getIndexOfChoice(this.state.nvQuestions[i], choiceName);
            choices.push({
                selection: idx
            })
        }

        let vote = {
            ballotVotes: [{
                choices: choices
            }]
        }

        //Delayed fire for performance improvement
        this.setState({ message: 'Sending vote' });

        let res = await nvClient.CastSignedVote(this.electionId, this.token, vote);
        if (res.txStatus === "complete" || res.txStatus === "pending") {
            // everything is good
            console.log('Vote Status: ' + res.txStatus);
            // this.setState({  message: 'Vote Status: ' + res.txStatus});
        } else {
            // an error occured, or vote is a duplicate
            console.log('Vote Error: ' + res.message);
        }
    }

    render() {

        const { classes } = this.props;
        // const { state } = this.state;

        return (
            <main className={classes.main}>
                <Fade in={this.state.showForm}>
                <Grid container>
                <Grid container style={{textAlign:"left"}}>
                    <Survey.Survey model={this.state.model} onComplete={this.onComplete}/>
                </Grid>
                </Grid>
                </Fade>
            </main>
        );
    }
}

Ballot.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Ballot);

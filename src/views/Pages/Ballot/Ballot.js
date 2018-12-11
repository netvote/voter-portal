import React from 'react';
import PropTypes from 'prop-types';
import { Fade, withStyles, Grid } from '@material-ui/core';
import NetvoteAPIs from '@netvote/netvote-api-sdk'
// import Send from '@material-ui/icons/Send';
import * as Survey from "survey-react";
import "survey-react/survey.css";

//Netvote Settings
import * as netvote_settings from '../../../config/netvote-settings';
const nvClient = NetvoteAPIs.initVoterClient(netvote_settings.NETVOTE_API_KEY);


var defaultThemeColors = Survey
    .StylesManager
    .ThemeColors["default"];


defaultThemeColors["$main-color"] = "#0daa9d";
defaultThemeColors["$main-hover-color"] = "#0daa9dc2";
defaultThemeColors["$text-color"] = "#4a4a4a";
defaultThemeColors["$header-color"] = "#ffffff";

defaultThemeColors["$header-background-color"] = "#0daa9d";
defaultThemeColors["$body-container-background-color"] = "#f8f8f8";

Survey
    .StylesManager
    .applyTheme();


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
    for (let j = 0; j < metadata.ballotGroups.length; j++) {
        let ballotGroup = metadata.ballotGroups[j];
        for (let i = 0; i < ballotGroup.ballotSections.length; i++) {
            let section = ballotGroup.ballotSections[i];

            let question = {
                type: "radiogroup",
                name: `${questionIdx++}`,
                title: section.sectionTitle,
                isRequired: true,
                colCount: 1,
                choices: []
            }
            for (let k = 0; k < section.ballotItems.length; k++) {
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
    for (let i = 0; i < section.ballotItems.length; i++) {
        if (section.ballotItems[i].itemTitle === choiceTxt) {
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

        this.onComplete = this.onComplete.bind(this);
        this.submitVote = this.submitVote.bind(this);

        getMetadata(this.electionId).then((surveyObj) => {
            this.setState({
                // To Suppress completed page add --> showCompletedPage: false
                model: new Survey.Model({ title: surveyObj.metadata.ballotTitle, completedHtml: "Please wait, Your vote is being recorded...", questions: surveyObj.questions }),
                metadata: surveyObj.metadata,
                nvQuestions: surveyObj.nvQuestions,
                showForm: true,
                complete: false
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
        message: `Please wait...`,
        metadata: {
            ballotTitle: "Loading..."
        },
        complete: false
    }

    submitVote(electionId, token, vote) {

        return new Promise((resolve, reject) => {
            setTimeout(async function () {
                let res = await nvClient.CastSignedVote(electionId, token, vote);
                if (res.txStatus === "complete" || res.txStatus === "pending") {
                    // everything is good
                    resolve(res.txStatus)
                } else {
                    // an error occured, or vote is a duplicate
                    reject(res.message)
                }

            }, 10)
        })
    }

    async onComplete(survey, options) {
        let choices = [];
        for (let i = 0; i < this.state.nvQuestions.length; i++) {
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

        let res;

        try {
            //Successful vote submission
            res = await this.submitVote(this.electionId, this.token, vote);
            this.setState({ complete: true, message: 'Vote Status: ' + res.txStatus });

            //TODO: Add success page w/ branded header or modal

        } catch (err) {
            //Vote submission failure 
            this.setState({ complete: true, message: 'Vote Error: ' + err });

            //TODO: Add error page w/ branded header or modal
        }
    }

    render() {

        const { classes } = this.props;
        // const { state } = this.state;

        if (this.state.complete) {
            return <h1 style={{ fontWeight: "bold", color: "red" }}>{this.state.message}</h1>;
        }

        return (
            <main className={classes.main}>
                <Fade in={this.state.showForm}>
                    <Grid container>
                        <Grid container style={{ textAlign: "left" }}>
                            <Survey.Survey model={this.state.model} onComplete={this.onComplete} />
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

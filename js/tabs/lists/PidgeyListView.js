'use strict';

/**
 * @providesModule PidgeyListView
 */

var React = require('React');
var ListContainer = require('ListContainer');
var Navigator = require('Navigator');
var PidgeyDrawerLayout = require('PidgeyDrawerLayout');
var { connect } = require('react-redux');
var { toggleTasks } = require('../../actions');

var TaskView = require('./TaskView');
var MyListsView = require('./MyListsView');
var TaskMapView = require('./TaskMapView');

var { createSelector } = require('reselect');

import type { TaskList } from '../../reducers/tasks';

import { View, Text, StyleSheet } from 'react-native';

type Props = {
    navigator: Navigator;
    taskList: TaskList;
    taskView: string;
    toggleTasks: (taskView: string) => void;
};

// TODO IMPLEMENT FILTER FOR DONE/ACTIVE/COMPLETED

const data = createSelector(
    (store) => store.taskList,
);

class PidgeyListView extends React.Component {
    props: Props;
    _drawer: ?PidgeyDrawerLayout;

    constructor(props) {
        super(props);
    }

    render() {
        const content = (
            <ListContainer
                title={this.props.list.currentList.listTitle}
                selectedView={this.props.taskView}
                onViewChange={this.toggleTasks}
                backgroundColor="white"
                selectedSectionColor="#51CDDA">
                <TaskView
                    taskView = "task"
                    taskList = {this.props.taskList}
                    navigator={this.props.navigator}
                />
            </ListContainer>
        );

        return content;
    }

    renderNavigationView() {
        return null;
    }

    toggleTasks(view) {
        this.props.toggleTasks(view);
    }
}

function select(store) {
    console.log(store.list);
    return {
        user: store.user,
        list: store.list
    }
}

function actions(dispatch) {
    return {
        toggleTasks: (view) => dispatch(toggleTasks(view)),
    };
}

var styles = StyleSheet.create({
    container: {
        paddingTop: 40,
        paddingHorizontal: 50,
        backgroundColor: 'white',
    },
});

module.exports = connect(select, actions)(PidgeyListView);

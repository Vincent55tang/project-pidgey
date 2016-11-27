var Navigator = require('Navigator');
var React = require('React');
var ListView = require('ListView');
var PidgeyTaskCell = require('./PidgeyTaskCell');
var PidgeyButton = require('PidgeyButton');
var PidgeyTaskModal = require('./PidgeyTaskModal');
var LoadingSpinner = require('LoadingSpinner');

var { connect } = require('react-redux');

var { getUserTasksReference } = require('../../firebase/tasks');

import { View, Text, StyleSheet, NativeModules } from 'react-native';
import { openTaskModal, showListMap, switchTab } from '../../actions';
import type { TaskList } from '../../reducers/tasks';

// var TSP = NativeModules.TSP;

type Props = {
    taskView: string;
    taskList: TaskList;
    navigator: Navigator;
};

// USE THIS FOR FILTERS!
type State = {
    taskList: TaskList;
};

class TaskView extends React.Component {
    props: Props;
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            isLoading: true,
        };

        (this: any).renderRow = this.renderRow.bind(this);
    }

    componentDidMount() {
        this.listenForTasks();
    }

    listenForTasks() {
        var taskRef = getUserTasksReference(this.props.userID, this.props.listID);
        taskRef.on('value', (snap) => {
            var tasks = [];
            snap.forEach((child) => {
                var check;
                if(child.val().checked === undefined) {
                    check = false;
                } else {
                    check = child.val().checked;
                }
                tasks.push({
                    title: child.val().title,
                    location: child.val().location,
                    checked: check,
                    key: child.key
                });
            });
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(tasks),
                isLoading: false,
            });
        });
    }

    showListMap() {
        this.listenForTasks();
        this.props.dispatch(showListMap(this.props.listID, this.props.title, this.state.dataSource._dataBlob.s1));
        this.props.dispatch(switchTab('map'));
    }

    render() {
        if(this.state.isLoading) {
            return (
                <LoadingSpinner />
            );
        }
        return (
            <View style={styles.container}>
                <ListView
                  dataSource={this.state.dataSource}
                  renderRow={(rowData) => this.renderRow(rowData)}
                />
                <PidgeyButton
                    style={styles.addButton}
                    caption="+"
                    onPress={()=>this.openEditModal()}
                />
                <PidgeyButton
                    style={styles.mapButton}
                    caption="M"
                    onPress={()=>this.showListMap()}
                />

                <PidgeyTaskModal/>
            </View>
        );
    }

    renderRow(task) {
        return (
            <PidgeyTaskCell
                title={task.title}
                location={task.location}
                taskID={task.key}
                checked={task.checked}
            />
        );
    }

    renderFooter() {
        return (<View style={styles.spacer} />);
    }

    openEditModal() {
        this.props.dispatch(openTaskModal({}, true));
    }
}

styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    addButton: {
        height: 60,
        width: 60,
        borderRadius: 30,
        position: 'absolute',
        bottom: 25,
        right: 25
    },
    mapButton: {
        height: 60,
        width: 120
    },
    spacer: {
        height: 100,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#9a9a94'
    }
})

function select(store) {
    return {
        userID: store.user.id,
        listID: store.list.currentList.listID,
        title: store.list.currentList.listTitle,
    }
}

module.exports = connect(select)(TaskView);

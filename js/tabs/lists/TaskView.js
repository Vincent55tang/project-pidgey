var Navigator = require('Navigator');
var React = require('React');
var ListView = require('ListView');
var PidgeyTaskCell = require('./PidgeyTaskCell');
var PidgeyButton = require('PidgeyButton');
var PidgeyTaskModal = require('./PidgeyTaskModal')

var { connect } = require('react-redux');

var { getUserTasksReference } = require('../../firebase/tasks');

import { View, Text, StyleSheet } from 'react-native';
import { openTaskModal } from '../../actions';
import type { TaskList } from '../../reducers/tasks';

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

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.loading}></View>
                <ListView
                  dataSource={this.state.dataSource}
                  renderRow={(rowData) => this.renderRow(rowData)}
                  renderFotter={this.renderFooter()}
                >
                </ListView>
                <PidgeyButton
                    style={styles.addButton}
                    caption="+"
                    onPress={()=>this.openEditModal()}
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
    }
}

module.exports = connect(select)(TaskView);

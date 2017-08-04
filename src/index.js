import React from 'react';
import tildePath from 'tilde-path';
import {FileDirectoryIcon, HomeIcon} from 'react-octicons-svg';
import {isGit, check} from 'git-state';

export const decorateConfig = config => Object.assign(config, {
	css: `
		${config.css || ''}

		.term_term {
			padding-bottom: 36px;
		}

		.status_status {
			display: flex;
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			height: 36px;
			background: rgba(255,255,255,0.05);
			padding: 6px 14px;
			font-size: 12px;
			line-height: 24px;
		}

		.status_group {
			display: flex;
		}

		.status_left {
			margin-right: auto;
		}

		.status_right {
			margin-left: auto;
		}

		.status_item .octicons {
			vertical-align: text-bottom;
			margin-right: .6em;
		}

		.octicons {
			fill: currentColor;
		}
	`
});

const FolderItem = ({session}) => {
	const shortPath = session.cwd && tildePath(session.cwd);
	return <div className='status_item'>
		{ shortPath === '~'
			? <HomeIcon />
			: <FileDirectoryIcon />}
		{shortPath}
	</div>;
};

const GitItem = ({session}) => null;

const Status = ({session}) => <footer className='status_status'>
	<div class='status_group status_left'>
		<FolderItem session={session} />
	</div>
	<div class='status_group status_right'>
		<GitItem session={session} />
	</div>
</footer>;

export const decorateTerm = (Term, {React}) => class extends React.Component {
	render() {
		const {customChildren, session} = this.props;

		return <Term {...this.props} customChildren={
			[]
				.concat(customChildren)
				.concat(
					<Status session={session} />
				)
			}
		/>;
	}
};

export const getTermProps = (uid, parentProps, props) => Object.assign(props, {
	session: parentProps.sessions[uid]
});

export const middleware = store => next => action => {
	switch(action.type) {
		case 'SESSION_SET_CWD':
			store.dispatch(dispatch => {
				isGit(action.cwd, is => {
					if(is) {
						check(action.cwd, (err, gitState) => {
							if(!err) {
								dispatch({
									type: 'SESSION_SET_GIT',
									gitState,
								});
							}
						});
					}
				});
			});
			next(action);
		default:
			next(action);
	}
};

export const reduceSessions = (action, state) => {
	switch(action.type) {
		case 'SESSION_SET_GIT':
			return state.setIn(['sessions', state.activeUid, 'git'], action.gitState);
		default:
			return state;
	}
};

export interface AuthState {
	user: {
		email: string;
		role: string;
		isLoggedIn: boolean;
		user_id: string;
	};
	login: (state: {
		email: string;
		role: string;
		isLoggedIn: boolean;
		user_id: string;
	}) => void;
	logout: () => void;
}

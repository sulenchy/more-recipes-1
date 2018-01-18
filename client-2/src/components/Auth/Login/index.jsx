import React from 'react';
import LoginForm from './LoginForm';

// /**
//  * SignUp Container component
//  */
// class SignUp extends React.Component {
//   /**
//    * Render the component jsx
//    * @returns {jsx} jsx
//    */
//   render() {
//     return ;
//   }
// }

const Login = () => ((
  <div className="container my-5">
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-8 col-xs-12">
        <div className="card wow fadeInUp">
          <div className="card-body">
            <div className="text-center row justify-content-center">
              <div className="col-10">
                <h3 className="text-center mb-3 mt-3"> Login </h3>
                <br />
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));
// component needs the signUp function
// the errors from the redux store.
export default Login;
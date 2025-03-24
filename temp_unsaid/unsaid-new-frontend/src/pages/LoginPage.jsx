import LoginForm from '../components/auth/LoginForm';

function LoginPage() {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 my-5">
          <div className="text-center mb-4">
            <h1 className="display-4">Unsaid</h1>
            <p className="lead">Share your thoughts anonymously</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

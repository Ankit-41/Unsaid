import RegisterForm from '../components/auth/RegisterForm';

function RegisterPage() {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 my-5">
          <div className="text-center mb-4">
            <h1 className="display-4">Unsaid</h1>
            <p className="lead">Join our anonymous community</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import shape1 from '../assets/images/shape1.svg';
import darkShape from '../assets/images/dark_shape.svg';
import shape2 from '../assets/images/shape2.svg';
import darkShape1 from '../assets/images/dark_shape1.svg';
import shape3 from '../assets/images/shape3.svg';
import darkShape2 from '../assets/images/dark_shape2.svg';
import loginImg from '../assets/images/login.png';
import logo from '../assets/images/logo.svg';
import googleIcon from '../assets/images/google.svg';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login({ email, password });
      navigate('/feed');
    } catch (err: any) {
      setErrors({
        api: err.message || 'Invalid email or password. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        <img src={shape1} alt="" className="_shape_img" />
        <img src={darkShape} alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src={shape2} alt="" className="_shape_img" />
        <img src={darkShape1} alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <img src={shape3} alt="" className="_shape_img" />
        <img src={darkShape2} alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_social_login_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_left">
                <div className="_social_login_left_image">
                  <img src={loginImg} alt="Image" className="_left_img" />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_login_content">
                <div className="_social_login_left_logo _mar_b28">
                  <img src={logo} alt="Image" className="_left_logo" />
                </div>
                <p className="_social_login_content_para _mar_b8">Welcome back</p>
                <h4 className="_social_login_content_title _titl4 _mar_b50">Login to your account</h4>
                <button type="button" className="_social_login_content_btn _mar_b40">
                  <img src={googleIcon} alt="Image" className="_google_img" /> <span>Or sign-in with google</span>
                </button>
                <div className="_social_login_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                <form className="_social_login_form" onSubmit={handleSubmit}>
                  {errors.api && (
                    <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '14px' }}>
                      {errors.api}
                    </div>
                  )}

                  <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8">Email</label>
                        <input
                          type="email"
                          className={`form-control _social_login_input ${errors.email ? 'is-invalid' : ''}`}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && (
                          <div className="invalid-feedback d-block mt-1" style={{ fontSize: '12px', color: '#dc3545' }}>
                            {errors.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8">Password</label>
                        <input
                          type="password"
                          className={`form-control _social_login_input ${errors.password ? 'is-invalid' : ''}`}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && (
                          <div className="invalid-feedback d-block mt-1" style={{ fontSize: '12px', color: '#dc3545' }}>
                            {errors.password}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                      <div className="form-check _social_login_form_check">
                        <input
                          className="form-check-input _social_login_form_check_input"
                          type="checkbox"
                          id="flexRadioDefault2"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          style={{ borderRadius: '0.25em' }}
                        />
                        <label className="form-check-label _social_login_form_check_label" htmlFor="flexRadioDefault2">
                          Remember me
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                      <div className="_social_login_form_left">
                        <p className="_social_login_form_left_para" style={{ cursor: 'pointer' }}>Forgot password?</p>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_login_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_login_form_btn_link _btn1 d-flex align-items-center justify-content-center"
                          disabled={isSubmitting}
                          style={{ gap: '8px' }}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              <span>Logging in...</span>
                            </>
                          ) : (
                            'Login now'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_login_bottom_txt">
                      <p className="_social_login_bottom_txt_para">
                        Don't have an account? <Link to="/register">Create New Account</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;

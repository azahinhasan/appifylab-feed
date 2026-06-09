import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import shape1 from '../assets/images/shape1.svg';
import darkShape from '../assets/images/dark_shape.svg';
import shape2 from '../assets/images/shape2.svg';
import darkShape1 from '../assets/images/dark_shape1.svg';
import shape3 from '../assets/images/shape3.svg';
import darkShape2 from '../assets/images/dark_shape2.svg';
import registrationImg from '../assets/images/registration.png';
import registrationImg1 from '../assets/images/registration1.png';
import logo from '../assets/images/logo.svg';
import googleIcon from '../assets/images/google.svg';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [agreeTerms, setTerms] = useState(true);

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    repeatPassword?: string;
    terms?: string;
    api?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const tempErrors: typeof errors = {};

    if (!firstName.trim()) {
      tempErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      tempErrors.lastName = 'Last name is required';
    }

    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (!repeatPassword) {
      tempErrors.repeatPassword = 'Please repeat your password';
    } else if (password !== repeatPassword) {
      tempErrors.repeatPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      tempErrors.terms = 'You must agree to the terms and conditions';
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
      await register({
        firstName,
        lastName,
        email,
        password,
      });
      navigate('/feed');
    } catch (err: any) {
      setErrors({
        api: err.message || 'Registration failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
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
      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <img src={registrationImg} alt="Image" />
                </div>
                <div className="_social_registration_right_image_dark">
                  <img src={registrationImg1} alt="Image" />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <img src={logo} alt="Image" className="_right_logo" />
                </div>
                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
                <button type="button" className="_social_registration_content_btn _mar_b40">
                  <img src={googleIcon} alt="Image" className="_google_img" /> <span>Register with google</span>
                </button>
                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                <form className="_social_registration_form" onSubmit={handleSubmit}>
                  {errors.api && (
                    <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '14px' }}>
                      {errors.api}
                    </div>
                  )}

                  <div className="row">
                    {/* First Name & Last Name in same row */}
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">First Name</label>
                        <input
                          type="text"
                          className={`form-control _social_registration_input ${errors.firstName ? 'is-invalid' : ''}`}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                        {errors.firstName && (
                          <div className="invalid-feedback d-block mt-1" style={{ fontSize: '12px', color: '#dc3545' }}>
                            {errors.firstName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Last Name</label>
                        <input
                          type="text"
                          className={`form-control _social_registration_input ${errors.lastName ? 'is-invalid' : ''}`}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                        {errors.lastName && (
                          <div className="invalid-feedback d-block mt-1" style={{ fontSize: '12px', color: '#dc3545' }}>
                            {errors.lastName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Email</label>
                        <input
                          type="email"
                          className={`form-control _social_registration_input ${errors.email ? 'is-invalid' : ''}`}
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
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Password</label>
                        <input
                          type="password"
                          className={`form-control _social_registration_input ${errors.password ? 'is-invalid' : ''}`}
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
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Repeat Password</label>
                        <input
                          type="password"
                          className={`form-control _social_registration_input ${errors.repeatPassword ? 'is-invalid' : ''}`}
                          value={repeatPassword}
                          onChange={(e) => setRepeatPassword(e.target.value)}
                        />
                        {errors.repeatPassword && (
                          <div className="invalid-feedback d-block mt-1" style={{ fontSize: '12px', color: '#dc3545' }}>
                            {errors.repeatPassword}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                      <div className="form-check _social_registration_form_check">
                        <input
                          className="form-check-input _social_registration_form_check_input"
                          type="checkbox"
                          id="agreeTerms"
                          checked={agreeTerms}
                          onChange={(e) => setTerms(e.target.checked)}
                          style={{ borderRadius: '0.25em' }}
                        />
                        <label className="form-check-label _social_registration_form_check_label" htmlFor="agreeTerms">
                          I agree to terms & conditions
                        </label>
                        {errors.terms && (
                          <div className="invalid-feedback d-block mt-1" style={{ fontSize: '12px', color: '#dc3545' }}>
                            {errors.terms}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_registration_form_btn_link _btn1 d-flex align-items-center justify-content-center"
                          disabled={isSubmitting}
                          style={{ gap: '8px' }}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              <span>Registering...</span>
                            </>
                          ) : (
                            'Register now'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account? <Link to="/login">Login here</Link>
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

export default RegisterPage;

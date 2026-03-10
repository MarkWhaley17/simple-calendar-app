import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import PrivacyPolicyView from '../../../screens/account/PrivacyPolicyView';
import TermsOfServiceView from '../../../screens/account/TermsOfServiceView';

describe('LegalViews', () => {
  it('renders Privacy Policy sections and handles back', () => {
    const onBack = jest.fn();
    const { getByText } = render(<PrivacyPolicyView onBack={onBack} />);

    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(getByText('What we store')).toBeTruthy();
    expect(getByText('How we use data')).toBeTruthy();
    expect(getByText('Your controls')).toBeTruthy();

    fireEvent.press(getByText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders Terms of Service sections and handles back', () => {
    const onBack = jest.fn();
    const { getByText } = render(<TermsOfServiceView onBack={onBack} />);

    expect(getByText('Terms of Service')).toBeTruthy();
    expect(getByText('Use of the app')).toBeTruthy();
    expect(getByText('Account responsibility')).toBeTruthy();
    expect(getByText('Content access')).toBeTruthy();

    fireEvent.press(getByText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

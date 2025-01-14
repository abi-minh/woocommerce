/**
 * External dependencies
 */
import { SETTINGS_STORE_NAME } from '@woocommerce/data';
import { recordEvent } from '@woocommerce/tracks';
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { getCountryCode } from '~/dashboard/utils';
import { hasCompleteAddress } from '../utils';
import {
	default as StoreLocationForm,
	FormValues,
	defaultValidate,
} from '~/task-lists/fills/steps/location';

const validateLocationForm = ( values: FormValues ) => {
	const errors = defaultValidate( values );

	if ( ! values.addressLine1.trim().length ) {
		errors.addressLine1 = __( 'Please enter an address', 'woocommerce' );
	}

	if ( ! values.postCode.trim().length ) {
		errors.postCode = __( 'Please enter a post code', 'woocommerce' );
	}

	if ( ! values.city.trim().length ) {
		errors.city = __( 'Please enter a city', 'woocommerce' );
	}
	return errors;
};

export const StoreLocation: React.FC< {
	nextStep: () => void;
} > = ( { nextStep } ) => {
	const { createNotice } = useDispatch( 'core/notices' );
	const { updateAndPersistSettingsForGroup } =
		useDispatch( SETTINGS_STORE_NAME );
	const { generalSettings, isResolving } = useSelect( ( select ) => {
		const { getSettings, hasFinishedResolution } =
			select( SETTINGS_STORE_NAME );

		return {
			generalSettings: getSettings( 'general' )?.general,
			isResolving: ! hasFinishedResolution( 'getSettings', [
				'general',
			] ),
		};
	} );

	useEffect( () => {
		if ( isResolving || ! hasCompleteAddress( generalSettings || {} ) ) {
			return;
		}
		nextStep();
	}, [ isResolving ] );

	if ( isResolving ) {
		return null;
	}

	return (
		<StoreLocationForm
			validate={ validateLocationForm }
			onComplete={ ( values: { [ key: string ]: string } ) => {
				if ( ! hasCompleteAddress( generalSettings || {} ) ) {
					return;
				}

				const country = getCountryCode( values.countryState );
				recordEvent( 'tasklist_tax_set_location', {
					country,
				} );
				nextStep();
			} }
			isSettingsRequesting={ false }
			settings={ generalSettings }
			updateAndPersistSettingsForGroup={
				updateAndPersistSettingsForGroup
			}
			createNotice={ createNotice }
			isSettingsError={ false }
		/>
	);
};

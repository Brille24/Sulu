<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\Content\Document;

/**
 * Constats class for localization states.
 */
class LocalizationState
{
    /**
     * Document is loaded in requested locale.
     */
    public const LOCALIZED = 'localized';

    /**
     * Document is using a fallback.
     */
    public const GHOST = 'ghost';

    /**
     * Document is using the content of a different localization.
     */
    public const SHADOW = 'shadow';
}
